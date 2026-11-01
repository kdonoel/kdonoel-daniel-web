import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Profile, SessionService } from '../components/session/session.service';
import { getChristmasYear } from '../components/utils/christmas.util';

// These pages already display a large login button
const PAGES_WITH_LOGIN_BUTTON: string[] = ['/', '/login'];

@Component({
	selector: 'n9-header',
	templateUrl: 'header.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class HeaderComponent {
	profile: Profile;
	showLoginButton: boolean = false;
	readonly year: number = getChristmasYear();

	constructor(
		private sessionService: SessionService,
		private router: Router,
	) {
		this.sessionService.session$.subscribe((session) => {
			this.profile = session?.profile;
		});
		this.router.events
			.pipe(filter((event) => event instanceof NavigationEnd))
			.subscribe((event: NavigationEnd) => {
				const path = event.urlAfterRedirects.split(/[?#]/)[0];
				this.showLoginButton = !PAGES_WITH_LOGIN_BUTTON.includes(path);
			});
	}
}
