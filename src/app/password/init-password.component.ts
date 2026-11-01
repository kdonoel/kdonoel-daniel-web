import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
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
export class InitPasswordComponent {
	resetForm: FormGroup;
	token: string;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private passwordService: PasswordService,
		private sessionService: SessionService,
		private swalService: SwalService,
	) {
		this.resetForm = fb.group(
			{
				email: ['', [Validators.required, Validators.email]],
				pwd: ['', [Validators.required, PwdValidatorDirective.validPwd]],
				confirmedPwd: ['', [Validators.required]],
			},
			{
				validators: [this.checkIfMatchingPasswords('pwd', 'confirmedPwd')],
			},
		);
	}

	onSubmit(): void {
		if (!this.resetForm.valid) return;

		const req: InitPasswordRequest = {
			email: this.resetForm.value.email,
			pwd: this.resetForm.value.pwd,
		};

		this.passwordService.initPassword(req).subscribe(
			(res) => {
				this.swalService.translateSuccess(
					'login.form.initPassword.success.title',
					'login.form.initPassword.success.description',
				);
				this.sessionService.openSession(res);
				(this.sessionService.login$ as Subject<any>).next(undefined);
				return this.router.navigate(['']);
			},
			(errorCode) => {
				this.swalService.translateError(
					'commons.error',
					`login.form.initPassword.errors.${errorCode}`,
				);
			},
		);
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
