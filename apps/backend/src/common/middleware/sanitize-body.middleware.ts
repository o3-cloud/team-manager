import { BadRequestException, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function assertNoBlockedKeys(val: unknown, depth = 0): void {
  if (depth > 20 || val === null || typeof val !== 'object') return;
  for (const key of Object.keys(val as Record<string, unknown>)) {
    if (BLOCKED_KEYS.has(key)) {
      throw new BadRequestException(`Property "${key}" is not allowed`);
    }
    assertNoBlockedKeys((val as Record<string, unknown>)[key], depth + 1);
  }
}

@Injectable()
export class SanitizeBodyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (req.body !== null && typeof req.body === 'object') {
      assertNoBlockedKeys(req.body);
    }
    next();
  }
}
