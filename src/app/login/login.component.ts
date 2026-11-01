import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { getErrorCode, getErrorMessageKey } from '../components/http/http-errors';
import { getLoginQueryParams, isSafeReturnUrl } from '../components/session/login-redirect';
import { CreateSessionBody, SessionService } from '../components/session/session.service';
import { LoginService } from './login.service';

@Component({
	selector: 'n9-login',
	templateUrl: 'login.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class LoginComponent implements OnInit {
	// Translation key of the error of the last attempt
	error: string;
	sessionExpired: boolean;
	loading: boolean = false;
	showPassword: boolean = false;
	loginForm: FormGroup;

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

		// The password rules are only checked when the password is chosen, older passwords may not follow them
		this.loginForm = this.fb.group({
			email: [history.state?.email ?? '', [Validators.required, Validators.email]],
			password: ['', [Validators.required]],
		});
	}

	// The returned page and the typed email are kept when creating the password
	get initPasswordQueryParams(): object {
		return getLoginQueryParams(this.returnUrl);
	}

	submit(): void {
		if (this.loginForm.invalid) {
			this.elementRef.nativeElement.querySelector<HTMLInputElement>('input.ng-invalid')?.focus();
			return;
		}

		this.loading = true;
		this.error = undefined;
		this.loginService
			.login(this.loginForm.getRawValue() as CreateSessionBody)
			.pipe(finalize(() => (this.loading = false)))
			.subscribe({
				// The session is opened by the login service
				next: (res) => {
					if (res.profile) {
						void this.router.navigateByUrl(this.returnUrl);
					}
				},
				error: (error: HttpErrorResponse) => {
					// The users created by BenJ choose their password at their first login
					if (getErrorCode(error) === 'init-password-required') {
						void this.router.navigate(['/password/init'], {
							queryParams: this.initPasswordQueryParams,
							state: { email: this.loginForm.value.email, firstLogin: true },
						});
						return;
					}
					this.sessionExpired = false;
					this.error = getErrorMessageKey(error);
				},
			});
	}
}
