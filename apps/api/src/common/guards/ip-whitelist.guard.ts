import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  private readonly logger = new Logger(IpWhitelistGuard.name);
  private readonly whitelistedIps: string[];
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    // Get whitelist configuration
    const whitelistString = this.configService.get<string>(
      'METRICS_IP_WHITELIST',
      '',
    );
    this.whitelistedIps = whitelistString
      ? whitelistString.split(',').map((ip) => ip.trim())
      : [];

    // Allow access from localhost by default
    if (!this.whitelistedIps.includes('127.0.0.1')) {
      this.whitelistedIps.push('127.0.0.1');
    }

    if (!this.whitelistedIps.includes('::1')) {
      this.whitelistedIps.push('::1');
    }

    // Only enable in production by default
    this.enabled = this.configService.get<boolean>(
      'METRICS_IP_WHITELIST_ENABLED',
      process.env.NODE_ENV === 'production',
    );

    this.logger.log(
      `IP whitelist ${this.enabled ? 'enabled' : 'disabled'}, allowed IPs: ${this.whitelistedIps.join(', ')}`,
    );
  }

  canActivate(context: ExecutionContext): boolean {
    // If whitelist is disabled, allow all requests
    if (!this.enabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);

    // Check if the IP is in the whitelist
    const isAllowed = this.whitelistedIps.some((whitelistedIp) => {
      // Support CIDR notation (basic implementation)
      if (whitelistedIp.includes('/')) {
        return this.isIpInCidr(ip, whitelistedIp);
      }

      // Exact match
      return ip === whitelistedIp;
    });

    if (!isAllowed) {
      this.logger.warn(`Access denied to metrics from IP: ${ip}`);
    }

    return isAllowed;
  }

  /**
   * Get the real client IP, handling proxies and X-Forwarded-For
   */
  private getClientIp(request: Request): string {
    // Check for the X-Forwarded-For header (when behind a proxy/load balancer)
    const forwarded = request.headers['x-forwarded-for'];

    if (forwarded) {
      // If X-Forwarded-For has multiple IPs, get the first one (client's real IP)
      const forwardedIps = (
        Array.isArray(forwarded) ? forwarded[0] : forwarded
      ).split(',');

      return forwardedIps[0].trim();
    }

    // Fall back to direct connection IP
    return request.ip || request.connection.remoteAddress || '127.0.0.1';
  }

  /**
   * Basic CIDR validation
   * This is a simplified implementation that works for common cases
   */
  private isIpInCidr(ip: string, cidr: string): boolean {
    // Get the IP in the CIDR format and the subnet mask bits
    const [rangeIp] = cidr.split('/');

    // Very simple check for now - only exact match of IP part
    // For a complete implementation, would need to convert to binary and check subnet
    return ip === rangeIp;
  }
}
