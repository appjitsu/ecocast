import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Interface for the CSP report data structure sent by browsers
 */
interface CSPReport {
  'csp-report': {
    'document-uri': string;
    referrer: string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    disposition: string;
    'blocked-uri': string;
    'status-code': number;
    'line-number'?: number;
    'column-number'?: number;
    'source-file'?: string;
    'script-sample'?: string;
  };
}

/**
 * Controller to handle Content Security Policy violation reports
 * sent by browsers when a CSP policy is violated
 */
@ApiTags('security')
@Controller('security')
export class CSPReportController {
  private readonly logger = new Logger(CSPReportController.name);

  /**
   * Endpoint to receive CSP violation reports from browsers
   * @param report The CSP violation report sent by the browser
   */
  @Post('csp-report')
  @ApiOperation({
    summary: 'Endpoint for browsers to report CSP violations',
    description:
      'When Content-Security-Policy-Report-Only or Content-Security-Policy with report-uri directive are used, browsers send violation reports to this endpoint.',
  })
  handleCSPReport(@Body() report: CSPReport) {
    const cspReport = report['csp-report'];

    if (!cspReport) {
      return { success: false, message: 'Invalid CSP report format' };
    }

    // Log the CSP violation
    this.logger.warn(
      `CSP Violation: ${cspReport['violated-directive']} on ${cspReport['document-uri']}`,
      {
        documentUri: cspReport['document-uri'],
        referrer: cspReport.referrer,
        violatedDirective: cspReport['violated-directive'],
        effectiveDirective: cspReport['effective-directive'],
        originalPolicy: cspReport['original-policy'],
        blockedUri: cspReport['blocked-uri'],
        statusCode: cspReport['status-code'],
        sourceFile: cspReport['source-file'],
        lineNumber: cspReport['line-number'],
        columnNumber: cspReport['column-number'],
        scriptSample: cspReport['script-sample'],
      },
    );

    return { success: true };
  }
}
