import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { InterceptorForwardErrorHeader } from '../components/http/handle-responses-error.post-interceptor';
import { CreateSessionBody, Session, SessionService } from '../components/session/session.service';

@Injectable()
export class LoginService {
	constructor(
		private sessionService: SessionService,
		private http: HttpClient,
	) {}

	public login(credentials: CreateSessionBody): Observable<Session> {
		return this.http
			.post('/sessions', credentials, {
				headers: {
					[InterceptorForwardErrorHeader]: '-',
				},
			})
			.pipe(
				map((res) => {
					this.sessionService.openSession(res as Session);
					return res as Session;
				}),
			);
	}
}
