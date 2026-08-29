import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // TODO: Implement JWT validation logic
    // 1. Extract token from request headers
    // 2. Validate token using JwtService
    // 3. Attach user to request object
    return true;
  }
}
