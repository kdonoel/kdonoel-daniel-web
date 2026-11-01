import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { Kdo } from '../components/models/users/kdos.models';
import { User } from '../components/models/users/users.models';
import { SessionService } from '../components/session/session.service';
import { StatusRequest } from './users.models';

@Injectable()
export class UsersService {
	private usersCache: { [id: string]: User };

	constructor(
		private sessionService: SessionService,
		private http: HttpClient,
	) {
		this.usersCache = {};
	}

	clearCache(): void {
		this.usersCache = {};
	}

	getUser(userId: string): Observable<User> {
		if (this.usersCache[userId]) {
			return of(this.usersCache[userId]);
		}

		return this.http.get(`/users/${userId}`).pipe(
			map((res: User) => {
				this.usersCache[res._id] = res;
				return res;
			}),
		);
	}

	getUsers(familyCode: string): Observable<User[]> {
		return this.http.get<User[]>(`/users`, {
			params: { 'family-code': familyCode },
		});
	}

	addKdo(userId: string, kdo: Kdo): Observable<User> {
		return this.http
			.post(`/users/${userId}/kdos`, {
				isSurprise: false,
				...kdo,
			})
			.pipe(
				map((res: User) => {
					this.usersCache[res._id] = res;
					return res;
				}),
			);
	}

	editKdo(userId: string, index: number, kdo: Kdo): Observable<User> {
		return this.http.put(`/users/${userId}/kdos/${index}`, kdo).pipe(
			map((res: User) => {
				this.usersCache[res._id] = res;
				return res;
			}),
		);
	}

	setStatus(userId: string, index: number, status: StatusRequest): Observable<User> {
		return this.http.put(`/users/${userId}/kdos/${index}/status`, status).pipe(
			map((res: User) => {
				this.usersCache[res._id] = res;
				return res;
			}),
		);
	}
}
