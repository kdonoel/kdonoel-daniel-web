import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingBarService } from '../angular-components/loading-bar/loading-bar.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
	constructor(private loadingBarService: LoadingBarService) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		this.loadingBarService.start();

		// The other interceptors can complete the request without any response, on errors
		return next.handle(req).pipe(finalize(() => this.loadingBarService.complete()));
	}
}
