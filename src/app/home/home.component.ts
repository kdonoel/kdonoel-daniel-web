import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { filter, finalize, switchMap } from 'rxjs/operators';

import { User } from '../components/models/users/users.models';
import { Profile, SessionService } from '../components/session/session.service';
import { getChristmasYear } from '../components/utils/christmas.util';
import { formatDayAndMonth, getPluralKey, PluralKey } from '../components/utils/french.util';
import { SelectItem } from '../components/utils/select-item';
import { TranslateUtilsService } from '../components/utils/translate-utils.service';
import { UsersService } from '../users/users.service';

@Component({
	selector: 'n9-home',
	templateUrl: 'home.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
	readonly year: number = getChristmasYear();
	profile: Profile;
	families: SelectItem[] = [];
	familyCode: string;
	// The connected user in the family, for the count of its ideas
	me: User;
	// The other members of the family
	members: User[] = [];
	loading: boolean = true;

	private subscription: Subscription = new Subscription();

	constructor(
		private router: Router,
		private sessionService: SessionService,
		private usersService: UsersService,
		private translateUtilsService: TranslateUtilsService,
	) {}

	ngOnInit(): void {
		this.subscription.add(
			this.sessionService.session$.subscribe((session) => {
				this.profile = session?.profile;
				if (this.profile?.familyCodes?.length) {
					this.translateUtilsService
						.translateSelectItems('families.', this.profile.familyCodes)
						.subscribe((families) => {
							// A family without translation is displayed with its code
							this.families = families.map(({ id, label }) => ({
								id,
								label: label === `families.${id}` ? id : label,
							}));
						});
				}
			}),
		);
		this.subscription.add(
			this.sessionService.familyCode$.subscribe((familyCode) => (this.familyCode = familyCode)),
		);
		this.subscription.add(
			combineLatest([this.sessionService.session$, this.sessionService.familyCode$])
				.pipe(
					filter(([session, familyCode]) => !!session && !!familyCode),
					switchMap(([, familyCode]) => {
						this.loading = true;
						return this.usersService
							.getUsers(familyCode)
							.pipe(finalize(() => (this.loading = false)));
					}),
				)
				.subscribe((users) => {
					this.me = users.find((user) => user._id === this.profile?._id);
					this.members = users.filter((user) => user._id !== this.profile?._id);
				}),
		);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	getPluralKey(count: number): PluralKey {
		return getPluralKey(count);
	}

	formatDayAndMonth(date: Date | string): string {
		return formatDayAndMonth(date);
	}

	onFamilyChange(familyCode: string): void {
		this.sessionService.setFamilyCode(familyCode);
	}

	// The form opens on the list, so that the new idea is visible once added
	addKdo(): void {
		void this.router.navigate(['/users', this.profile._id], { state: { addKdo: true } });
	}
}
