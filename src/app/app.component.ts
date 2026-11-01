import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';

import { InterceptorForwardErrorHeader } from './components/http/handle-responses-error.post-interceptor';
import { Session, SessionService } from './components/session/session.service';
import { getChristmasYear } from './components/utils/christmas.util';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	// The footer stays at the bottom of the page
	host: { class: 'd-flex flex-column min-vh-100' },
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class AppComponent {
	private localeFilePrefix: string = 'locale-';

	constructor(
		private translateService: TranslateService,
		private sessionService: SessionService,
		private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
		private titleService: Title,
		private http: HttpClient,
	) {
		this.titleService.setTitle(`Kdos Noël ${getChristmasYear()}`);

		// i18n configuration
		this.translateService.setFallbackLang(`${this.localeFilePrefix}fr-FR`);

		// session configuration
		this.sessionService.load();
		// Each visit renews the session, so that the users are still logged in the next Christmas.
		// Silent: the current session stays valid when the renewal fails.
		if (this.sessionService.session$.getValue()) {
			this.http
				.post<Session>(
					'/sessions/refresh',
					{},
					{ headers: { [InterceptorForwardErrorHeader]: '-' } },
				)
				.subscribe({
					next: (session) => this.sessionService.updateSession(session),
					error: () => undefined,
				});
		}

		angulartics2GoogleAnalytics.startTracking();
	}
}
