import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { InterceptorForwardErrorHeader } from '../components/http/handle-responses-error.post-interceptor';
import { Session } from '../components/session/session.service';

export class PasswordResetRequest {
	public oldPassword: string;
	public newPassword: string;
}

export class InitPasswordRequest {
	email: string;
	pwd: string;
}

/**
 * The errors are forwarded to the forms, which display them next to the fields
 */
@Injectable()
export class PasswordService {
	constructor(private http: HttpClient) {}

	resetPassword(req: PasswordResetRequest): Observable<unknown> {
		return this.http.post('/users/reset/password', req, {
			headers: { [InterceptorForwardErrorHeader]: '-' },
		});
	}

	initPassword(req: InitPasswordRequest): Observable<Session> {
		return this.http.post<Session>('/users/init/password', req, {
			headers: { [InterceptorForwardErrorHeader]: '-' },
		});
	}
}
