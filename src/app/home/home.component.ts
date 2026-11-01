import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, switchMap } from 'rxjs/operators';

import { User } from '../components/models/users/users.models';
import { Profile, SessionService } from '../components/session/session.service';
import { getChristmasYear } from '../components/utils/christmas.util';
import { formatDayAndMonth, getPluralKey, PluralKey } from '../components/utils/french.util';
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
	familyCode: string;
	// The connected user in the family, for the count of its ideas
	me: User;
	// The other members of the family
	members: User[] = [];
	loading: boolean = true;

	private subscription: Subscription = new Subscription();

	constructor(
		private sessionService: SessionService,
		private usersService: UsersService,
	) {}

	ngOnInit(): void {
		this.subscription.add(
			this.sessionService.session$.subscribe((session) => (this.profile = session?.profile)),
		);
		this.subscription.add(
			this.sessionService.familyCode$.subscribe((familyCode) => (this.familyCode = familyCode)),
		);
		this.subscription.add(
			combineLatest([
				// The renewed session of the same user doesn't reload the lists
				this.sessionService.session$.pipe(
					map((session) => session?.profile._id),
					distinctUntilChanged(),
				),
				this.sessionService.familyCode$,
			])
				.pipe(
					filter(([userId, familyCode]) => !!userId && !!familyCode),
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
}
