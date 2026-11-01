import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigurationService } from '../conf/configuration.service';

@Injectable()
export class BaseHrefApiPreInterceptor implements HttpInterceptor {
	constructor(private conf: ConfigurationService) {}

	public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const isIgnoredRoute =
			this.conf.getInstant<string[]>('api.ignoredRoutes').filter((ignoreRoute) => {
				return new RegExp(ignoreRoute, 'g').test(req.url);
			}).length > 0;

		if (isIgnoredRoute) {
			return next.handle(req);
		}
		const baseHref = this.conf.getInstant<string>('api.baseHref');
		const duplicate = req.clone({
			url: baseHref + req.url,
		});
		return next.handle(duplicate);
	}
}
