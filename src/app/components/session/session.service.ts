import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
	// The admins send the invitations, missing in the sessions opened before
	isAdmin?: boolean;
}

export interface Session {
	token: string;
	profile: Profile;
}

@Injectable()
export class SessionService {
	public static readonly sessionKey: string = 'session';
	// The family displayed on the home page, kept for the next visits
	public static readonly familyCodeKey: string = 'familyCode';

	public session$: BehaviorSubject<Session> = new BehaviorSubject(undefined);
	public isLogged$: Observable<boolean> = this.session$.pipe(map((p) => !!p));
	// The saved session was expired when the app started, the login page tells it
	public expiredAtLoad: boolean = false;
	private _familyCode$: BehaviorSubject<string> = new BehaviorSubject(null as any);

	get familyCode$(): BehaviorSubject<string> {
		return this._familyCode$;
	}

	/**
	 * Expiration date of the JWT in milliseconds, undefined when it can't be read
	 */
	private static getTokenExpiration(token: string): number | undefined {
		try {
			const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
			return typeof payload.exp === 'number' ? payload.exp * 1000 : undefined;
		} catch {
			return undefined;
		}
	}

	public load(): void {
		const session: Session = JSON.parse(localStorage.getItem(SessionService.sessionKey));
		if (!session) return;
		if (!this.isTokenValid(session)) {
			// eslint-disable-next-line no-console
			console.error('JWT expired');
			this.logout();
			this.expiredAtLoad = true;
			return;
		}
		this.openSession(session);
	}

	public logout(): void {
		localStorage.removeItem(SessionService.sessionKey);
		this.session$.next(null);
	}

	public openSession(session: Session): void {
		const familyCodes = session.profile.familyCodes ?? [];
		const savedFamilyCode = localStorage.getItem(SessionService.familyCodeKey);
		if (familyCodes.includes(savedFamilyCode)) {
			this._familyCode$.next(savedFamilyCode);
		} else {
			this._familyCode$.next(familyCodes[0] ?? 'Daniel'); // for smooth migration
		}
		localStorage.setItem(SessionService.sessionKey, JSON.stringify(session));
		this.expiredAtLoad = false;
		this.session$.next(session);
	}

	/**
	 * Renewed session of the same user: new token and up to date profile
	 */
	public updateSession(session: Session): void {
		localStorage.setItem(SessionService.sessionKey, JSON.stringify(session));
		this.session$.next(session);
	}

	public isTokenValid(session?: Session): boolean {
		session = session || this.session$.getValue();
		if (!session?.token) return false;
		// The API checks the token anyway, the expiration date only avoids a failing request
		const expiration = SessionService.getTokenExpiration(session.token);
		return !expiration || expiration > Date.now();
	}

	public setFamilyCode(familyCode: string): void {
		localStorage.setItem(SessionService.familyCodeKey, familyCode);
		this._familyCode$.next(familyCode);
	}
}
