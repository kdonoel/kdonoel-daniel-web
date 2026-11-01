import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, of, Subscription, switchMap } from 'rxjs';

import { User } from '../components/models/users/users.models';
import { Profile, SessionService } from '../components/session/session.service';
import { getChristmasYear } from '../components/utils/christmas.util';
import { UsersService } from '../users/users.service';

@Component({
	selector: 'n9-home',
	templateUrl: 'home.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
	profile: Profile;
	subscription: Subscription;
	usersObservable: Observable<User[]>;
	readonly year: number = getChristmasYear();

	constructor(
		private sessionService: SessionService,
		private usersService: UsersService,
	) {}

	ngOnInit(): void {
		this.subscription = this.sessionService.session$.subscribe((s) => {
			if (s) {
				this.profile = s.profile;
			} else {
				delete this.profile;
			}
		});

		this.usersObservable = combineLatest(
			of<string>(this.sessionService.familyCode$.value),
			this.sessionService.familyCode$,
		).pipe(
			switchMap(() => {
				return this.usersService.getUsers(this.sessionService.familyCode$.getValue());
			}),
		);
	}

	ngOnDestroy(): void {
		if (this.subscription) this.subscription.unsubscribe();
	}
}
