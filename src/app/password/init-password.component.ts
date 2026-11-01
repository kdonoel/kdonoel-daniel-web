import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { getErrorCode, getErrorMessageKey } from '../components/http/http-errors';
import { getLoginQueryParams, isSafeReturnUrl } from '../components/session/login-redirect';
import { SessionService } from '../components/session/session.service';
import { SwalService } from '../components/utils/swal.service';
import { PwdValidatorDirective } from '../components/validators/pwd.validator.directive';
import { InitPasswordRequest, PasswordService } from './password.service';

@Component({
	selector: 'kdos-init-password',
	templateUrl: 'init-password.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class InitPasswordComponent implements OnInit {
	resetForm: FormGroup;
	// Redirected from the login page
	firstLogin: boolean;
	// Translation key of the error of the last attempt
	error: string;
	passwordAlreadySet: boolean;
	submitted: boolean = false;
	loading: boolean = false;
	showPassword: boolean = false;

	private returnUrl: string;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private elementRef: ElementRef<HTMLElement>,
		private passwordService: PasswordService,
		private sessionService: SessionService,
		private swalService: SwalService,
	) {}

	ngOnInit(): void {
		const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
		this.returnUrl = isSafeReturnUrl(returnUrl) ? returnUrl : '/';
		this.firstLogin = !!history.state?.firstLogin;

		this.resetForm = this.fb.group(
			{
				email: [history.state?.email ?? '', [Validators.required, Validators.email]],
				pwd: ['', [Validators.required, PwdValidatorDirective.validPwd]],
				confirmedPwd: ['', [Validators.required]],
			},
			{
				validators: [this.checkIfMatchingPasswords('pwd', 'confirmedPwd')],
			},
		);
	}

	get loginQueryParams(): object {
		return getLoginQueryParams(this.returnUrl);
	}

	onSubmit(): void {
		this.submitted = true;
		if (this.resetForm.invalid) {
			// The confirmation is the field to fix when the passwords are different
			const element = this.elementRef.nativeElement;
			(
				element.querySelector<HTMLInputElement>('input.ng-invalid') ??
				element.querySelector<HTMLInputElement>('#confirmedPwd')
			)?.focus();
			return;
		}

		const req: InitPasswordRequest = {
			email: this.resetForm.value.email,
			pwd: this.resetForm.value.pwd,
		};

		this.loading = true;
		this.error = undefined;
		this.passwordService
			.initPassword(req)
			.pipe(finalize(() => (this.loading = false)))
			.subscribe({
				next: (session) => {
					this.swalService.toast('initPassword.toast');
					this.sessionService.openSession(session);
					void this.router.navigateByUrl(this.returnUrl);
				},
				error: (error: HttpErrorResponse) => {
					this.passwordAlreadySet = getErrorCode(error) === 'password-already-set';
					this.error =
						getErrorCode(error) === 'user-not-found'
							? 'initPassword.userNotFound'
							: getErrorMessageKey(error);
				},
			});
	}

	public checkIfMatchingPasswords(
		passwordKey: string,
		passwordConfirmationKey: string,
	): ValidatorFn {
		return (group: FormGroup) => {
			const passwordInput = group.controls[passwordKey];
			const passwordConfirmationInput = group.controls[passwordConfirmationKey];
			if (passwordInput.value !== passwordConfirmationInput.value) {
				return { notEquivalent: true };
			}
			return;
		};
	}
}
