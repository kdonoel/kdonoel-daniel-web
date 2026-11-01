import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NEVER, Observable } from 'rxjs';
import { UsersService } from 'src/app/users/users.service';

import { ConfigurationService } from '../conf/configuration.service';
import { Session, SessionService } from '../session/session.service';
import { noop } from '../utils/misc.util';

@Injectable()
export class DefaultHeadersApiPreInterceptor implements HttpInterceptor {
	private readonly AUTHORIZATION_HEADER: string = 'x-jwt-token';
	private readonly ACCEPT_LANGUAGE_HEADER: string = 'accept-language';
	private session: Session;

	constructor(
		private conf: ConfigurationService,
		private router: Router,
		private usersService: UsersService,
		private sessionService: SessionService,
		private translateService: TranslateService,
	) {
		this.sessionService.session$.subscribe((session) => {
			if (session) {
				this.session = session;
			} else {
				this.session = null;
			}
		});
	}

	public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if (req.url.startsWith(this.conf.getInstant<string>('api.baseHref'))) {
			let newHeaders = req.headers;

			if (this.translateService.currentLang) {
				newHeaders = newHeaders.append(
					this.ACCEPT_LANGUAGE_HEADER,
					this.translateService.currentLang,
				);
			}

			if (this.session) {
				if (!this.sessionService.isTokenValid()) {
					console.error('jwt invalid, logout and redirect to login');
					this.usersService.clearCache();
					this.sessionService.logout();
					this.router.navigate(['/login']).then(noop);

					return NEVER;
				}
				newHeaders = newHeaders.append(this.AUTHORIZATION_HEADER, this.session.token);
			}

			const duplicate = req.clone({
				headers: newHeaders,
			});
			return next.handle(duplicate);
		}
		return next.handle(req);
	}
}
