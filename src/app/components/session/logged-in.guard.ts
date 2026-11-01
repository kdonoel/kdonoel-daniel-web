import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { SessionService } from './session.service';

@Injectable()
export class LoggedInGuard {
	constructor(
		private session: SessionService,
		private router: Router,
	) {}

	canActivate(): Observable<boolean> | Promise<boolean> | boolean {
		return this.session.isLogged$.pipe(
			map((isLogged) => {
				if (isLogged) {
					return true;
				}
				void this.router.navigate(['login']);
				return false;
			}),
			take(1),
		);
	}
}
