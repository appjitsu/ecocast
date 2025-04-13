import { Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';

/**
 * Custom TypeORM query logger that tracks slow queries and emits events
 */
export class DatabaseQueryLogger {
  private readonly logger = new Logger('TypeORM');
  private readonly slowQueryThreshold: number;
  private readonly logAllQueries: boolean;
  private readonly logQueriesOnError: boolean;

  constructor(options?: {
    slowQueryThreshold?: number;
    logAllQueries?: boolean;
    logQueriesOnError?: boolean;
  }) {
    this.slowQueryThreshold =
      options?.slowQueryThreshold ||
      parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000', 10);
    this.logAllQueries =
      options?.logAllQueries || process.env.NODE_ENV !== 'production';
    this.logQueriesOnError = options?.logQueriesOnError || true;
  }

  /**
   * Get TypeORM logger options based on environment
   */
  public getLoggerOptions(): LoggerOptions {
    if (process.env.NODE_ENV === 'production') {
      return ['error', 'warn', 'schema', 'migration'];
    }

    return ['error', 'warn', 'schema', 'migration', 'info'];
  }

  /**
   * Log a query with its execution time
   */
  public logQuery(query: string, parameters?: unknown[]): void {
    if (!this.logAllQueries) return;

    const queryLog =
      `Query: ${query}` +
      (parameters ? ` -- Parameters: ${JSON.stringify(parameters)}` : '');
    this.logger.debug(queryLog);
  }

  /**
   * Log a query that took longer than the threshold
   */
  public logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    queryRunner?: QueryRunner,
  ): void {
    // Create query metadata
    const queryData = {
      query: this.formatQuery(query, parameters),
      time,
      connection: queryRunner?.connection?.name || 'default',
      threshold: this.slowQueryThreshold,
    };

    // Log warning for slow query
    this.logger.warn(
      `Slow query detected (${time}ms): ${this.formatQuery(query, parameters)}`,
    );
  }

  /**
   * Log query error
   */
  public logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
  ): void {
    const errorLog =
      `Query Failed: ${query}` +
      (parameters ? ` -- Parameters: ${JSON.stringify(parameters)}` : '');
    if (error instanceof Error) {
      this.logger.error(errorLog, error.stack);
    } else {
      this.logger.error(errorLog, error);
    }
  }

  /**
   * Log schema build messages
   */
  public logSchemaBuild(message: string): void {
    this.logger.log(message);
  }

  /**
   * Log migration messages
   */
  public logMigration(message: string): void {
    this.logger.log(message);
  }

  /**
   * Log general query success info
   */
  public log(level: 'log' | 'info' | 'warn', message: string): void {
    switch (level) {
      case 'log':
        this.logger.log(message);
        break;
      case 'info':
        this.logger.debug(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }

  /**
   * Format a query with its parameters for display
   */
  private formatQuery(query: string, parameters?: unknown[]): string {
    let formattedQuery = query;

    if (parameters && parameters.length > 0) {
      parameters.forEach((param) => {
        let formattedParam: string;
        if (param === null || param === undefined) {
          formattedParam = 'NULL';
        } else if (typeof param === 'object') {
          try {
            const stringified = JSON.stringify(param);
            formattedParam =
              stringified === undefined
                ? '[Complex Object]'
                : `'${stringified}'`;
          } catch {
            formattedParam = '[Complex Object]';
          }
        } else {
          formattedParam = this.formatParameterValue(param);
        }

        // Replace parameter placeholder
        formattedQuery = formattedQuery.replace(/\$\d+/, formattedParam);
      });
    }

    return formattedQuery;
  }

  /**
   * Format a parameter value for display in logs
   */
  private formatParameterValue(value: unknown): string {
    if (value === undefined) {
      return 'undefined';
    }
    if (value === null) {
      return 'null';
    }
    if (typeof value === 'string') {
      return `'${value}'`;
    }
    if (typeof value === 'object') {
      try {
        const stringified = JSON.stringify(value);
        return stringified === '{}' || stringified === '[]'
          ? stringified
          : `'${stringified}'`;
      } catch {
        return '[Complex Object]';
      }
    }
    // For other primitive types that can be safely converted (number or boolean)
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    // For any other types, use a generic representation
    return '[Complex Value]';
  }
}
