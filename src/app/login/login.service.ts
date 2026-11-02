import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { InterceptorForwardErrorHeader } from '../components/http/handle-responses-error.post-interceptor';
import { CreateSessionBody, Session, SessionService } from '../components/session/session.service';

/**
 * The email address, or the first and last names when the address is forgotten
 */
export interface LoginLinkRequest {
	email?: string;
	firstName?: string;
	lastName?: string;
}

export interface LoginLinkResponse {
	// Addresses the links were sent to, partially hidden: "b•••n@gmail.com"
	emails: string[];
}

/**
 * The errors are forwarded to the pages, which explain them next to the forms
 */
@Injectable()
export class LoginService {
	private readonly options: object = { headers: { [InterceptorForwardErrorHeader]: '-' } };

	constructor(
		private sessionService: SessionService,
		private http: HttpClient,
	) {}

	public login(credentials: CreateSessionBody): Observable<Session> {
		return this.http.post('/sessions', credentials, this.options).pipe(
			map((res) => {
				this.sessionService.openSession(res as Session);
				return res as Session;
			}),
		);
	}

	public requestLink(request: LoginLinkRequest): Observable<LoginLinkResponse> {
		return this.http.post<LoginLinkResponse>('/sessions/links', request, this.options);
	}

	public loginWithLink(token: string): Observable<Session> {
		return this.http
			.post<Session>('/sessions/links/login', { token }, this.options)
			.pipe(tap((session) => this.sessionService.openSession(session)));
	}

	/**
	 * New link sent to the owner of an expired one
	 */
	public renewLink(token: string): Observable<LoginLinkResponse> {
		return this.http.post<LoginLinkResponse>('/sessions/links/renew', { token }, this.options);
	}
}
