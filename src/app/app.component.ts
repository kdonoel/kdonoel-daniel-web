import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { LoadingBarService } from './components/angular-components/loading-bar/loading-bar.service';
import { ConfigurationService } from './components/conf/configuration.service';
import { SessionService } from './components/session/session.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
	title: string = 'kdos-daniel-web';

	private localeFilePrefix: string = 'locale-';

	constructor(
		private translateService: TranslateService,
		private sessionService: SessionService,
		private conf: ConfigurationService,
		private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
	) {
		// i18n configuration
		this.translateService.setDefaultLang(`${this.localeFilePrefix}fr-FR`);
		// this.translateService.use(this.localeFilePrefix + "fr-FR");

		// session configuration
		this.sessionService.load();

		// this.sessionService.session$.subscribe((p) => console.log('new session value', p));
		// this.sessionService.login$.subscribe((p) => console.log('logged in'));
		// this.sessionService.logout$.subscribe((p) => console.log('logged out'));

		angulartics2GoogleAnalytics.startTracking();
	}
}
