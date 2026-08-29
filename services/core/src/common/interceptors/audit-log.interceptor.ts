import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        // TODO: Implement audit logging
        // 1. Extract user info from request
        // 2. Log action, resource, duration
        // 3. Store to audit_logs table
        console.log(`[AUDIT] ${method} ${url} - ${duration}ms`);
      }),
    );
  }
}
