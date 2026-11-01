import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { getErrorCode, getErrorMessageKey } from '../components/http/http-errors';
import { SwalService } from '../components/utils/swal.service';
import { LoginService } from './login.service';

/**
 * - loading: logging in with the token
 * - expired: a new link can be sent without typing anything
 * - invalid: unknown token, the user asks for a new link on the login page
 * - error: the API can't be reached, the user can try again
 * - sent: a new link was sent
 */
export type LoginLinkState = 'loading' | 'expired' | 'invalid' | 'error' | 'sent';

/**
 * Page opened by the links sent by email, the token is in the fragment: /login/link#<token>
 */
@Component({
	selector: 'kdos-login-link',
	templateUrl: 'login-link.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class LoginLinkComponent implements OnInit, OnDestroy {
	state: LoginLinkState = 'loading';
	// Translation key of the error
	error: string;
	renewing: boolean = false;
	sentEmails: string[] = [];

	private token: string;
	private subscription: Subscription;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private location: Location,
		private loginService: LoginService,
		private swalService: SwalService,
	) {}

	ngOnInit(): void {
		// Another link opened in the same tab only changes the fragment
		this.subscription = this.route.fragment.subscribe((fragment) => {
			if (!fragment) {
				this.state = this.token ? this.state : 'invalid';
				return;
			}
			this.token = fragment;
			// The token is personal, it leaves the address bar
			this.location.replaceState(this.location.path(false));
			this.login();
		});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}

	login(): void {
		this.state = 'loading';
		this.loginService.loginWithLink(this.token).subscribe({
			next: (session) => {
				this.swalService.toast('loginLink.toast', { firstName: session.profile.firstName });
				void this.router.navigateByUrl('/', { replaceUrl: true });
			},
			error: (error: HttpErrorResponse) => {
				const code = getErrorCode(error);
				if (code === 'login-link-expired') {
					this.state = 'expired';
				} else if (code === 'login-link-not-found') {
					this.state = 'invalid';
				} else {
					this.state = 'error';
					this.error = getErrorMessageKey(error);
				}
			},
		});
	}

	renew(): void {
		this.renewing = true;
		this.error = undefined;
		this.loginService
			.renewLink(this.token)
			.pipe(finalize(() => (this.renewing = false)))
			.subscribe({
				next: ({ emails }) => {
					this.sentEmails = emails;
					this.state = 'sent';
				},
				error: (error: HttpErrorResponse) => (this.error = getErrorMessageKey(error)),
			});
	}
}
