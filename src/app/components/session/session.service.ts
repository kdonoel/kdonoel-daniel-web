import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

export class CreateSessionBody {
	public email: string;
	public password?: string;
}

export interface Profile {
	familyCodes: string[];
	firstName: string;
	lastName: string;
	email: string;
	_id: string;
}

export interface Session {
	token: string;
	profile: Profile;
}

@Injectable()
export class SessionService {
	public static readonly sessionKey: string = 'session';

	public session$: BehaviorSubject<Session> = new BehaviorSubject(undefined);
	public isLogged$: Observable<boolean> = this.session$.pipe(map((p) => !!p));
	public login$: Observable<any> = new Subject();
	public logout$: Observable<any> = new Subject();
	private _familyCode$: BehaviorSubject<string> = new BehaviorSubject(null as any);

	get familyCode$(): BehaviorSubject<string> {
		return this._familyCode$;
	}

	public load(): void {
		const session: Session = JSON.parse(localStorage.getItem(SessionService.sessionKey));
		if (!session) return;
		if (!this.isTokenValid(session)) {
			// eslint-disable-next-line no-console
			console.error('JWT invalid');
			return;
		}
		(this.logout$ as Subject<any>).next(undefined);
		this.openSession(session);
	}

	public logout(): void {
		this.closeSession();
		(this.logout$ as Subject<any>).next(undefined);
	}

	public openSession(session: Session): void {
		if (session.profile.familyCodes?.length) {
			this.setFamilyCode(session.profile.familyCodes[0]);
		} else {
			this.setFamilyCode('Daniel'); // for smooth migration
		}
		localStorage.setItem(SessionService.sessionKey, JSON.stringify(session));
		this.session$.next(session);
		(this.login$ as Subject<any>).next(undefined);
	}

	public isTokenValid(session?: Session): boolean {
		session = session || this.session$.getValue();
		return !!session;
	}

	public setFamilyCode(familyCode: string): void {
		this._familyCode$.next(familyCode);
	}

	private closeSession(): void {
		localStorage.removeItem(SessionService.sessionKey);
		this.session$.next(null);
	}
}
