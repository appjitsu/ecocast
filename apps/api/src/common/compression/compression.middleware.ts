import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import { NextFunction, Request, Response } from 'express';
import * as zlib from 'zlib';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private readonly compressionFilter: (req: Request, res: Response) => boolean;
  private readonly compressionOptions: compression.CompressionOptions;

  constructor(private readonly configService: ConfigService) {
    // Get environment configuration
    const enableBrotli = this.configService.get<boolean>('ENABLE_BROTLI', true);
    const compressionLevel = this.configService.get<number>(
      'COMPRESSION_LEVEL',
      6,
    );
    const threshold = this.configService.get<number>(
      'COMPRESSION_THRESHOLD',
      1024,
    );

    // Configure compression options with enhanced settings
    this.compressionOptions = {
      // Use Brotli if available and enabled, otherwise gzip
      // Brotli generally achieves better compression ratios than gzip
      level: compressionLevel,
      threshold,
      memLevel: this.configService.get<number>('COMPRESSION_MEM_LEVEL', 8),
      chunkSize: this.configService.get<number>(
        'COMPRESSION_CHUNK_SIZE',
        16 * 1024,
      ),
      // Add Brotli support
      ...(enableBrotli && {
        brotli: {
          enabled: true,
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: compressionLevel,
            [zlib.constants.BROTLI_PARAM_SIZE_HINT]: threshold,
          },
        },
      }),
    };

    // Determine when to skip compression with more precise rules
    this.compressionFilter = (req: Request, res: Response) => {
      // Check for no-transform directive in Cache-Control header
      const cacheControl = res.getHeader('Cache-Control');
      if (
        cacheControl &&
        typeof cacheControl === 'string' &&
        cacheControl.includes('no-transform')
      ) {
        return false;
      }

      // Skip for already compressed content types
      const contentEncoding = res.getHeader('Content-Encoding');
      if (contentEncoding) {
        return false;
      }

      // Skip compression for certain content types
      const contentType = res.getHeader('Content-Type')?.toString() || '';

      // Skip for image, video, audio, PDF, and other compressed formats
      if (
        contentType.includes('image/') ||
        contentType.includes('video/') ||
        contentType.includes('audio/') ||
        contentType.includes('application/pdf') ||
        contentType.includes('application/zip') ||
        contentType.includes('application/gzip') ||
        contentType.includes('application/x-7z-compressed') ||
        contentType.includes('application/x-rar-compressed')
      ) {
        return false;
      }

      // Always compress text-based content
      if (
        contentType.includes('application/json') ||
        contentType.includes('text/') ||
        contentType.includes('application/javascript') ||
        contentType.includes('application/xml') ||
        contentType.includes('application/x-www-form-urlencoded')
      ) {
        return true;
      }

      // Default to compression implementation's default behavior for anything else
      return compression.filter(req, res);
    };
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Apply compression middleware with our custom options
    const compressionMiddleware = compression({
      ...this.compressionOptions,
      filter: this.compressionFilter,
    });

    // Execute the middleware and explicitly mark with void to avoid floating promise warning
    void compressionMiddleware(req, res, next);
  }
}
