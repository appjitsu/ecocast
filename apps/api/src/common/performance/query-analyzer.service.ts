import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Query analysis result interface
 */
export interface QueryAnalysis {
  query: string;
  parameters: unknown[];
  executionTime: number;
  timestamp: Date;
  possibleImprovements: string[];
  suggestedOptimizations: string[];
}

/**
 * Service for analyzing database queries and suggesting optimizations
 */
@Injectable()
export class QueryAnalyzerService {
  private readonly logger = new Logger(QueryAnalyzerService.name);
  private readonly slowQueryThreshold: number;
  private readonly logSlowQueries: boolean;
  private readonly saveQueriesPath: string | null;
  private readonly queriesCache: Map<string, QueryAnalysis[]> = new Map();
  private readonly queryPatterns: { [key: string]: RegExp } = {
    selectAll: /SELECT\s+\*\s+FROM/i,
    noWhere:
      /SELECT\s+.+?\s+FROM\s+\w+(\s+JOIN\s+.+?)?(\s+(ORDER|GROUP|LIMIT))?(\s*;)?$/i,
    notIndexed: /WHERE\s+\w+\s*([=><!]+|LIKE|IN|BETWEEN)/i,
    multipleJoins: /(JOIN\s+\w+){3,}/i,
    subqueries: /SELECT\s+.+?\s+FROM\s+.+?\(\s*SELECT/i,
    orderByRandom: /ORDER\s+BY\s+RANDOM\(\)/i,
    distinctCount: /COUNT\s*\(\s*DISTINCT/i,
    orConditions: /WHERE\s+.+?\s+OR\s+.+?/i,
    likeWithWildcardPrefix: /LIKE\s*'%/i,
    limit: /LIMIT\s+(\d+\s*,\s*)?(\d+)/i,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Load configuration
    this.slowQueryThreshold = this.configService.get<number>(
      'database.slowQueryThreshold',
      500, // Default: 500ms
    );
    this.logSlowQueries = this.configService.get<boolean>(
      'database.logSlowQueries',
      true,
    );
    this.saveQueriesPath =
      this.configService.get<string>(
        'database.saveQueriesPath',
        '', // Using empty string as default instead of null
      ) || null; // Convert empty string to null if needed

    // Listen for query events
    this.eventEmitter.on('query:executed', (data: unknown) => {
      if (
        data &&
        typeof data === 'object' &&
        'query' in data &&
        typeof data.query === 'string' &&
        'parameters' in data &&
        Array.isArray(data.parameters) &&
        'executionTime' in data &&
        typeof data.executionTime === 'number'
      ) {
        this.handleQueryEvent({
          query: data.query,
          parameters: data.parameters,
          executionTime: data.executionTime,
        });
      } else {
        this.logger.warn('Received malformed query data event');
      }
    });
  }

  /**
   * Handle query executed event
   */
  private handleQueryEvent(data: {
    query: string;
    parameters: unknown[];
    executionTime: number;
  }): void {
    // Skip analyze for special queries
    if (this.shouldSkipAnalysis(data.query)) {
      return;
    }

    // Analyze slow queries
    if (data.executionTime > this.slowQueryThreshold) {
      this.analyzeSlowQuery(data);
    }

    // Store query for pattern analysis
    this.storeQuery(data);
  }

  /**
   * Determine if a query should be skipped from analysis
   */
  private shouldSkipAnalysis(query: string): boolean {
    // Skip schema related queries
    const skipPatterns = [
      /^CREATE\s+/i,
      /^DROP\s+/i,
      /^ALTER\s+/i,
      /^COMMENT\s+/i,
      /^GRANT\s+/i,
      /^REVOKE\s+/i,
      /information_schema/i,
      /pg_catalog/i,
      /^SET\s+/i,
      /^SHOW\s+/i,
      /^EXPLAIN\s+/i,
    ];

    return skipPatterns.some((pattern) => pattern.test(query));
  }

  /**
   * Analyze a slow query and log suggestions
   */
  private analyzeSlowQuery(data: {
    query: string;
    parameters: unknown[];
    executionTime: number;
  }): void {
    const analysis = this.analyzeQuery(data);

    // Log the slow query
    if (this.logSlowQueries) {
      this.logger.warn(
        `Slow query detected (${data.executionTime}ms)${
          analysis.possibleImprovements.length > 0
            ? ': ' + analysis.possibleImprovements.join(', ')
            : ''
        }`,
        {
          query: data.query,
          parameters: data.parameters,
          executionTime: data.executionTime,
          suggestions: analysis.suggestedOptimizations,
        },
      );
    }

    // Save the query to file if configured
    if (this.saveQueriesPath) {
      this.saveQueryToFile(analysis);
    }

    // Emit an event with the analysis - ensure analysis is properly typed
    try {
      // Create a safely typed copy to ensure all properties are present
      const safeAnalysis: QueryAnalysis = {
        query: analysis.query,
        parameters: Array.isArray(analysis.parameters)
          ? analysis.parameters
          : [],
        executionTime:
          typeof analysis.executionTime === 'number'
            ? analysis.executionTime
            : 0,
        timestamp:
          analysis.timestamp instanceof Date ? analysis.timestamp : new Date(),
        possibleImprovements: Array.isArray(analysis.possibleImprovements)
          ? analysis.possibleImprovements
          : [],
        suggestedOptimizations: Array.isArray(analysis.suggestedOptimizations)
          ? analysis.suggestedOptimizations
          : [],
      };

      this.eventEmitter.emit('query:analyzed', safeAnalysis);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to emit query analysis event: ${errorMessage}`);
    }
  }

  /**
   * Analyze a query for potential improvements
   */
  private analyzeQuery(data: {
    query: string;
    parameters: unknown[];
    executionTime: number;
  }): QueryAnalysis {
    const { query, parameters, executionTime } = data;
    const possibleImprovements: string[] = [];
    const suggestedOptimizations: string[] = [];

    // Check for common inefficient patterns
    if (this.queryPatterns.selectAll.test(query)) {
      possibleImprovements.push('Selecting all columns (*)');
      suggestedOptimizations.push(
        'Specify only needed columns instead of SELECT *',
      );
    }

    if (this.queryPatterns.noWhere.test(query)) {
      possibleImprovements.push('Query without WHERE clause');
      suggestedOptimizations.push('Add a WHERE clause to filter results');
    }

    if (this.queryPatterns.notIndexed.test(query)) {
      possibleImprovements.push('Potential non-indexed field in WHERE clause');
      suggestedOptimizations.push(
        'Check if all fields in WHERE clause are indexed',
      );
    }

    if (this.queryPatterns.multipleJoins.test(query)) {
      possibleImprovements.push('Multiple joins detected');
      suggestedOptimizations.push(
        'Consider denormalizing data or creating a view',
      );
    }

    if (this.queryPatterns.subqueries.test(query)) {
      possibleImprovements.push('Subquery detected');
      suggestedOptimizations.push(
        'Consider using JOIN or refactoring to separate queries',
      );
    }

    if (this.queryPatterns.orderByRandom.test(query)) {
      possibleImprovements.push('ORDER BY RANDOM() is costly');
      suggestedOptimizations.push(
        'Consider alternative randomization techniques',
      );
    }

    if (this.queryPatterns.distinctCount.test(query)) {
      possibleImprovements.push('COUNT(DISTINCT) can be slow');
      suggestedOptimizations.push(
        'Consider using GROUP BY or a subquery with DISTINCT',
      );
    }

    if (this.queryPatterns.orConditions.test(query)) {
      possibleImprovements.push(
        'OR conditions may not use indexes efficiently',
      );
      suggestedOptimizations.push(
        'Consider UNION or restructuring query conditions',
      );
    }

    if (this.queryPatterns.likeWithWildcardPrefix.test(query)) {
      possibleImprovements.push('LIKE with wildcard prefix is non-indexable');
      suggestedOptimizations.push(
        'Avoid leading wildcards or use full-text search',
      );
    }

    // Check if a LIMIT clause is present and suggest adding one if not
    if (!this.queryPatterns.limit.test(query)) {
      possibleImprovements.push('No LIMIT clause');
      suggestedOptimizations.push('Add LIMIT to reduce result set size');
    }

    return {
      query,
      parameters,
      executionTime,
      timestamp: new Date(),
      possibleImprovements,
      suggestedOptimizations,
    };
  }

  /**
   * Store query for pattern analysis
   */
  private storeQuery(data: {
    query: string;
    parameters: unknown[];
    executionTime: number;
  }): void {
    // Create normalized query key (remove parameter values)
    const normalizedQuery = this.normalizeQuery(data.query);

    // Get or create entry in cache
    if (!this.queriesCache.has(normalizedQuery)) {
      this.queriesCache.set(normalizedQuery, []);
    }

    const analysis = this.analyzeQuery(data);
    const queryList = this.queriesCache.get(normalizedQuery)!; // Add non-null assertion

    // Add to cache and limit to 10 entries per query type
    queryList.push(analysis);
    if (queryList.length > 10) {
      queryList.shift();
    }
  }

  /**
   * Normalize a query for caching
   */
  private normalizeQuery(query: string): string {
    // Replace specific values with placeholders
    return query
      .replace(/\s+/g, ' ')
      .replace(/('[^']*')|(\d+)|(\$\d+)/g, '?')
      .trim();
  }

  /**
   * Save query analysis to file
   */
  private saveQueryToFile(analysis: QueryAnalysis): void {
    if (!this.saveQueriesPath) return;

    try {
      // Ensure directory exists
      if (!fs.existsSync(this.saveQueriesPath)) {
        fs.mkdirSync(this.saveQueriesPath, { recursive: true });
      }

      // Create filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace(/\./g, '_');
      const filename = path.join(
        this.saveQueriesPath,
        `slow_query_${timestamp}.json`,
      );

      // Write to file
      fs.writeFileSync(filename, JSON.stringify(analysis, null, 2));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to save query analysis to file: ${errorMessage}`,
      );
    }
  }

  /**
   * Get recent slow queries
   */
  getRecentSlowQueries(): QueryAnalysis[] {
    const allQueries: QueryAnalysis[] = [];

    for (const queries of this.queriesCache.values()) {
      allQueries.push(
        ...queries.filter((q) => q.executionTime > this.slowQueryThreshold),
      );
    }

    return allQueries
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 20);
  }

  /**
   * Get top slow query patterns
   */
  getTopSlowQueryPatterns(): {
    pattern: string;
    avgTime: number;
    count: number;
  }[] {
    const patterns: Map<
      string,
      { totalTime: number; count: number; avgTime: number }
    > = new Map();

    // Aggregate query statistics
    for (const [pattern, queries] of this.queriesCache.entries()) {
      const slowQueries = queries.filter(
        (q) => q.executionTime > this.slowQueryThreshold,
      );

      if (slowQueries.length === 0) continue;

      const totalTime = slowQueries.reduce(
        (sum, q) => sum + q.executionTime,
        0,
      );
      const count = slowQueries.length;
      const avgTime = totalTime / count;

      patterns.set(pattern, { totalTime, count, avgTime });
    }

    // Convert to array and sort
    return Array.from(patterns.entries())
      .map(([pattern, stats]) => ({
        pattern,
        avgTime: stats.avgTime,
        count: stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime);
  }
}
