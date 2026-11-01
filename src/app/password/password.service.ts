import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { InterceptorForwardErrorHeader } from '../components/http/handle-responses-error.post-interceptor';

export class PasswordResetRequest {
	public oldPassword: string;
	public newPassword: string;
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
}
