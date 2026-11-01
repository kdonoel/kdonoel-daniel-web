import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { getErrorCode, getErrorMessageKey } from '../components/http/http-errors';
import { User } from '../components/models/users/users.models';
import { Profile, SessionService } from '../components/session/session.service';
import { getPluralKey } from '../components/utils/french.util';
import { SwalService } from '../components/utils/swal.service';
import { PwdValidatorDirective } from '../components/validators/pwd.validator.directive';
import { PasswordResetRequest, PasswordService } from '../password/password.service';
import { UsersService } from '../users/users.service';
import { InvitationsService } from './invitations.service';

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
	saving: boolean = false;
	submitted: boolean = false;
	showPassword: boolean = false;
	// Translation key of the error of the last attempt
	error: string;
	profile: Profile;
	inviting: boolean = false;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private elementRef: ElementRef<HTMLElement>,
		private passwordService: PasswordService,
		private sessionService: SessionService,
		private swalService: SwalService,
		private usersService: UsersService,
		private invitationsService: InvitationsService,
	) {
		this.resetForm = fb.group(
			{
				// The rules are only checked when the password is chosen, older passwords may not follow them
				oldPwd: ['', [Validators.required]],
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
		this.sessionService.logout();
		void this.router.navigate(['/']);
	}

	ngOnInit(): void {
		this.loading = true;
		this.profile = this.sessionService.session$.getValue().profile;
		const userId = this.profile._id;
		this.usersService
			.getUser(userId)
			.pipe(finalize(() => (this.loading = false)))
			.subscribe((user) => (this.user = user));
	}

	async invite(familyCode: string): Promise<void> {
		const confirmed = await this.swalService.confirm(
			'account.invitations.confirm.title',
			'account.invitations.confirm.text',
			'account.invitations.confirm.send',
			{ family: familyCode },
		);
		if (!confirmed) return;

		this.inviting = true;
		this.invitationsService
			.send(familyCode)
			.pipe(finalize(() => (this.inviting = false)))
			.subscribe(({ sentCount, failedCount }) => {
				if (failedCount) {
					this.swalService.error('account.invitations.failed', { sentCount, failedCount });
				} else {
					this.swalService.toast(`account.invitations.sent.${getPluralKey(sentCount)}`, {
						count: sentCount,
					});
				}
			});
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

		const reqReset: PasswordResetRequest = {
			oldPassword: this.resetForm.value.oldPwd,
			newPassword: this.resetForm.value.pwd,
		};

		this.saving = true;
		this.error = undefined;
		this.passwordService
			.resetPassword(reqReset)
			.pipe(finalize(() => (this.saving = false)))
			.subscribe({
				next: () => {
					this.swalService.toast('account.password.toast');
					this.submitted = false;
					// Without any event, the empty fields are not displayed as errors
					this.resetForm.reset(undefined, { emitEvent: false });
				},
				error: (error: HttpErrorResponse) => {
					this.error =
						getErrorCode(error) === 'invalid-credentials'
							? 'account.password.invalid'
							: getErrorMessageKey(error);
				},
			});
	}
}
