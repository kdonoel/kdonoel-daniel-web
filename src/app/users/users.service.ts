import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { InterceptorForwardErrorHeader } from '../components/http/handle-responses-error.post-interceptor';
import { Kdo } from '../components/models/users/kdos.models';
import { User } from '../components/models/users/users.models';
import { StatusRequest } from './users.models';

/**
 * The lists are always loaded from the API: the family changes them at the same time.
 * The responses of the updates are not used, the API in production returned hidden data in them.
 */
@Injectable()
export class UsersService {
	constructor(private http: HttpClient) {}

	getUser(userId: string): Observable<User> {
		return this.http.get<User>(`/users/${userId}`);
	}

	getUsers(familyCode: string): Observable<User[]> {
		return this.http.get<User[]>(`/users`, {
			params: { 'family-code': familyCode },
		});
	}

	addKdo(userId: string, kdo: Kdo): Observable<unknown> {
		return this.http.post(`/users/${userId}/kdos`, {
			isSurprise: false,
			...kdo,
		});
	}

	editKdo(userId: string, index: number, kdo: Kdo): Observable<unknown> {
		return this.http.put(`/users/${userId}/kdos/${index}`, kdo);
	}

	/**
	 * The errors are forwarded: someone else may have reserved the idea meanwhile, the list has to be reloaded
	 */
	setStatus(userId: string, index: number, status: StatusRequest): Observable<unknown> {
		return this.http.put(`/users/${userId}/kdos/${index}/status`, status, {
			headers: { [InterceptorForwardErrorHeader]: '-' },
		});
	}
}
