import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { getLoginQueryParams } from './login-redirect';
import { SessionService } from './session.service';

@Injectable()
export class LoggedInGuard {
	constructor(
		private session: SessionService,
		private router: Router,
	) {}

	canActivate(_route: unknown, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
		return this.session.isLogged$.pipe(
			take(1),
			// Come back to the requested page once logged in
			map(
				(isLogged) =>
					isLogged ||
					this.router.createUrlTree(['/login'], { queryParams: getLoginQueryParams(state.url) }),
			),
		);
	}
}
