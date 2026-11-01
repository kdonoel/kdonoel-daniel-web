import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { LoadingBarService } from '../angular-components/loading-bar/loading-bar.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
	constructor(private loadingBarService: LoadingBarService) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		this.loadingBarService.start();

		return next.handle(req).pipe(
			catchError((error: HttpErrorResponse) => {
				this.loadingBarService.complete();
				return throwError(error);
			}),
			map((event) => {
				if (event instanceof HttpResponse) {
					this.loadingBarService.complete();
				}
				return event;
			}),
		);
	}
}
