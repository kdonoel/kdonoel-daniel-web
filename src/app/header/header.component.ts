import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Profile, SessionService } from '../components/session/session.service';
import { getChristmasYear } from '../components/utils/christmas.util';
import { SelectItem } from '../components/utils/select-item';
import { TranslateUtilsService } from '../components/utils/translate-utils.service';

@Component({
	selector: 'n9-header',
	templateUrl: 'header.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class HeaderComponent {
	profile: Profile;
	loading: boolean;
	families: SelectItem[];
	family: string;
	readonly year: number = getChristmasYear();

	constructor(
		private sessionService: SessionService,
		private translateUtilsService: TranslateUtilsService,
	) {
		this.loading = true;

		this.sessionService.session$.subscribe((s) => {
			if (s) {
				this.profile = s.profile;
				this.translateUtilsService
					.translateSelectItems('families.', this.profile.familyCodes)
					.subscribe((families) => {
						this.families = families;
					});
				this.family = this.sessionService.familyCode$.value;
				this.sessionService.familyCode$.subscribe((family) => {
					if (this.family !== family) {
						this.family = family;
					}
				});
			} else {
				delete this.profile;
				this.loading = false;
			}
		});
	}

	onFamilySelect(family: SelectItem): void {
		this.sessionService.setFamilyCode(family.id);
	}
}
