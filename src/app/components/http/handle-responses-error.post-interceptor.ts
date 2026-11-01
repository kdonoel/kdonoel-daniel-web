import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoadingBarService } from '../angular-components/loading-bar/loading-bar.service';
import { SessionService } from '../session/session.service';
import { SwalService } from '../utils/swal.service';

export const InterceptorSkipHeader = 'X-Interceptor-Skip';
export const InterceptorForwardErrorHeader = 'X-Interceptor-Forward-Error';

@Injectable()
export class HandleResponsesErrorPostInterceptor implements HttpInterceptor {
	private static getErrorKeyFromCode(code: number): string {
		switch (code) {
			case 400:
			case 401:
			case 403:
			case 404:
			case 409:
			case 500:
			case 501:
			case 502:
			case 503:
			case 504:
			case 505:
			case 506:
			case 507:
			case 508:
			case 509:
				return `commons.errors.http.${code}`;
			default:
				return 'commons.errors.unknown-error';
		}
	}
	private translateService: TranslateService;

	constructor(
		private swalService: SwalService,
		private injector: Injector,
		private loadingBarService: LoadingBarService,
		private sessionService: SessionService,
	) {
		setTimeout(() => {
			this.translateService = injector.get(TranslateService);
		});
	}

	public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// skip while logging and swal processing
		if (req.headers.has(InterceptorSkipHeader)) {
			const headers = req.headers.delete(InterceptorSkipHeader);
			return next.handle(req.clone({ headers }));
		}

		// log + swal but forward error for post processing
		if (req.headers.has(InterceptorForwardErrorHeader)) {
			const headers = req.headers.delete(InterceptorForwardErrorHeader);
			return next.handle(req.clone({ headers })).pipe(
				catchError((error: HttpErrorResponse) => {
					// console.error('http-error', error.status, error);
					// this.swalService.translateError('commons.error', this.getErrorKeyFromCode(error.status));
					// this.translateService
					// 	.get(this.getErrorKeyFromCode(error.status))
					// 	.subscribe((t) => console.error(t));
					return throwError(error);
				}),
			);
		}

		return next.handle(req).pipe(
			catchError((error: HttpErrorResponse) => {
				this.loadingBarService.complete();
				if (error.name && error.message) {
					// eslint-disable-next-line no-console
					console.error('http-error', error.status, error);

					if (error.status === 401 && error.error?.code === 'invalid-signature') {
						this.sessionService.logout();
						SwalService.error(
							`Session invalide (${error.error?.code})`,
							`Vous avez été déconnecté de la version 2021 du site. Veuillez initialiser votre mot de passe.`,
						);
					} else {
						this.translateService
							.get(HandleResponsesErrorPostInterceptor.getErrorKeyFromCode(error.status))
							.subscribe((t) => {
								SwalService.error(
									this.translateService.instant('commons.error'),
									`${t}<br />${(error as any).error?.code ?? ''}`,
								);
								// eslint-disable-next-line no-console
								console.error(t);
							});
					}
					return new Observable<HttpEvent<any>>((observer) => observer.complete());
				}
				return throwError(error) as Observable<HttpEvent<any>>;
			}),
		);
	}
}
