import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Profile, SessionService } from '../components/session/session.service';
import { getChristmasYear } from '../components/utils/christmas.util';

@Component({
	selector: 'n9-header',
	templateUrl: 'header.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class HeaderComponent {
	profile: Profile;
	readonly year: number = getChristmasYear();

	constructor(private sessionService: SessionService) {
		this.sessionService.session$.subscribe((session) => {
			this.profile = session?.profile;
		});
	}
}
