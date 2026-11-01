import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../components/models/users/users.models';
import { SessionService } from '../components/session/session.service';

import { noop } from '../components/utils/misc.util';
import { SwalService } from '../components/utils/swal.service';
import { PwdValidatorDirective } from '../components/validators/pwd.validator.directive';
import { PasswordResetRequest, PasswordService } from '../password/password.service';
import { UsersService } from '../users/users.service';

@Component({
	selector: 'al-profile',
	templateUrl: 'user-profile.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class UserProfileComponent implements OnInit {
	resetForm: FormGroup;
	user: User;
	loading: boolean = false;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private passwordService: PasswordService,
		private sessionService: SessionService,
		private swal: SwalService,
		private userServices: UsersService,
	) {
		this.resetForm = fb.group(
			{
				oldPwd: ['', [Validators.required, PwdValidatorDirective.validPwd]],
				pwd: ['', [Validators.required, PwdValidatorDirective.validPwd]],
				confirmedPwd: ['', [Validators.required]],
			},
			{
				validators: [this.checkIfMatchingPasswords('pwd', 'confirmedPwd')],
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

	logout(): void {
		this.userServices.clearCache();
		this.sessionService.logout();
		this.router.navigate(['/']).then(noop);
	}

	ngOnInit(): void {
		this.loading = true;
		const userId = this.sessionService.session$.getValue().profile._id;
		this.userServices.getUser(userId).subscribe((user) => {
			this.user = user;
			this.loading = false;
		});
	}

	onSubmit(): void {
		if (!this.resetForm.valid) return;

		const reqReset: PasswordResetRequest = {
			oldPassword: this.resetForm.value.oldPwd,
			newPassword: this.resetForm.value.pwd,
		};

		this.passwordService.resetPassword(reqReset).subscribe(
			() => {
				this.swal.translateSuccess(
					'login.form.resetPassword.success.title',
					'login.form.resetPassword.success.description',
				);
			},
			(errorCode) => {
				this.swal.translateError('commons.error', `login.form.resetPassword.errors.${errorCode}`);
			},
		);
	}
}
