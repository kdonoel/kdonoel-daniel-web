import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface InvitationResponse {
	sentCount: number;
	failedCount: number;
}

/**
 * Yearly invitations with a personal login link, sent by the admins
 */
@Injectable()
export class InvitationsService {
	constructor(private http: HttpClient) {}

	send(familyCode: string): Observable<InvitationResponse> {
		return this.http.post<InvitationResponse>('/invitations', { familyCode });
	}
}
