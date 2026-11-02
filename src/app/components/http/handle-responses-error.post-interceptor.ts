import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { navigateToLogin } from '../session/login-redirect';
import { SessionService } from '../session/session.service';
import { SwalService } from '../utils/swal.service';
import { getErrorMessageKey, isSessionError } from './http-errors';

// The error is forwarded to the caller, which displays it, instead of being displayed in a popup
export const InterceptorForwardErrorHeader = 'X-Interceptor-Forward-Error';

@Injectable()
export class HandleResponsesErrorPostInterceptor implements HttpInterceptor {
	constructor(
		private swalService: SwalService,
		private sessionService: SessionService,
		private router: Router,
	) {}

	public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const forwardError = req.headers.has(InterceptorForwardErrorHeader);
		const request = forwardError
			? req.clone({ headers: req.headers.delete(InterceptorForwardErrorHeader) })
			: req;

		return next.handle(request).pipe(
			catchError((error: unknown) => {
				if (!(error instanceof HttpErrorResponse)) return throwError(() => error);

				// Whatever the request, an expired session leads to the login page
				if (isSessionError(error)) {
					this.sessionService.logout();
					void navigateToLogin(this.router, this.router.url, true);
					return EMPTY;
				}
				if (forwardError) return throwError(() => error);

				// eslint-disable-next-line no-console
				console.error('http-error', error.status, error);
				this.swalService.error(getErrorMessageKey(error));
				return EMPTY;
			}),
		);
	}
}
