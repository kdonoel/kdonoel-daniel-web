import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { getErrorCode, getErrorMessageKey } from '../components/http/http-errors';
import { isSafeReturnUrl } from '../components/session/login-redirect';
import { CreateSessionBody, SessionService } from '../components/session/session.service';
import { LoginLinkRequest, LoginService } from './login.service';

/**
 * - link: a login link sent to the email address, the default
 * - names: the same link, found with the first and last names when the address is forgotten
 * - password: the former login, kept for the users who have a password
 * - sent: the link was sent
 */
export type LoginMode = 'link' | 'names' | 'password' | 'sent';

@Component({
	selector: 'n9-login',
	templateUrl: 'login.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class LoginComponent implements OnInit {
	mode: LoginMode = 'link';
	// Translation keys of the messages
	error: string;
	info: string;
	sessionExpired: boolean;
	loading: boolean = false;
	showPassword: boolean = false;
	// Addresses the link was sent to, partially hidden
	sentEmails: string[] = [];

	emailForm: FormGroup;
	namesForm: FormGroup;
	passwordForm: FormGroup;

	private returnUrl: string;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private elementRef: ElementRef<HTMLElement>,
		private sessionService: SessionService,
		private loginService: LoginService,
	) {}

	ngOnInit(): void {
		const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
		this.returnUrl = isSafeReturnUrl(returnUrl) ? returnUrl : '/';
		if (this.sessionService.session$.getValue()) {
			void this.router.navigateByUrl(this.returnUrl);
		}
		this.sessionExpired = !!history.state?.sessionExpired || this.sessionService.expiredAtLoad;

		this.emailForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
		});
		this.namesForm = this.fb.group({
			firstName: ['', [Validators.required]],
			lastName: ['', [Validators.required]],
		});
		// The password rules are only checked when the password is chosen, older passwords may not follow them
		this.passwordForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required]],
		});
	}

	setMode(mode: LoginMode): void {
		// The address typed in a form is kept in the other one
		if (mode === 'password') {
			this.passwordForm.patchValue({ email: this.emailForm.value.email });
		} else if (mode === 'link' && this.mode === 'password') {
			this.emailForm.patchValue({ email: this.passwordForm.value.email });
		}
		this.mode = mode;
		this.error = undefined;
		this.info = undefined;
	}

	sendLinkByEmail(): void {
		if (this.isInvalid(this.emailForm)) return;
		this.sendLink({ email: this.emailForm.value.email.trim() });
	}

	sendLinkByNames(): void {
		if (this.isInvalid(this.namesForm)) return;
		this.sendLink({
			firstName: this.namesForm.value.firstName.trim(),
			lastName: this.namesForm.value.lastName.trim(),
		});
	}

	loginWithPassword(): void {
		if (this.isInvalid(this.passwordForm)) return;

		this.loading = true;
		this.error = undefined;
		const credentials: CreateSessionBody = {
			email: this.passwordForm.value.email.trim(),
			password: this.passwordForm.value.password,
		};
		this.loginService
			.login(credentials)
			.pipe(finalize(() => (this.loading = false)))
			.subscribe({
				// The session is opened by the login service
				next: (res) => {
					if (res.profile) {
						void this.router.navigateByUrl(this.returnUrl);
					}
				},
				error: (error: HttpErrorResponse) => {
					this.sessionExpired = false;
					const code = getErrorCode(error);
					// The users created by BenJ have no password: they log in with a link
					if (code === 'init-password-required') {
						this.setMode('link');
						this.info = 'login.noPassword';
					} else if (code === 'invalid-credentials') {
						this.error = 'login.errors.invalidCredentials';
					} else {
						this.error = getErrorMessageKey(error);
					}
				},
			});
	}

	private sendLink(request: LoginLinkRequest): void {
		this.loading = true;
		this.error = undefined;
		this.loginService
			.requestLink(request)
			.pipe(finalize(() => (this.loading = false)))
			.subscribe({
				next: ({ emails }) => {
					this.sentEmails = emails;
					this.mode = 'sent';
					this.info = undefined;
					this.sessionExpired = false;
				},
				error: (error: HttpErrorResponse) => {
					if (getErrorCode(error) === 'user-not-found') {
						this.error = request.email ? 'login.errors.unknownEmail' : 'login.errors.unknownNames';
					} else {
						this.error = getErrorMessageKey(error);
					}
				},
			});
	}

	// The errors of the form are displayed by the ShowErrorsDirective, the first field to fix is focused
	private isInvalid(form: FormGroup): boolean {
		if (form.valid) return false;
		this.elementRef.nativeElement.querySelector<HTMLInputElement>('input.ng-invalid')?.focus();
		return true;
	}
}
