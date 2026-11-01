import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CreateSessionBody, SessionService } from '../components/session/session.service';
import { noop } from '../components/utils/misc.util';
import { PwdValidatorDirective } from '../components/validators/pwd.validator.directive';
import { LoginService } from './login.service';

@Component({
	selector: 'n9-login',
	templateUrl: 'login.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class LoginComponent implements OnInit {
	errors: string[] = [];
	loading: boolean;

	loginForm: FormGroup;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private sessionService: SessionService,
		private loginService: LoginService,
	) {}

	ngOnInit(): void {
		if (this.sessionService.session$.getValue()) {
			this.router.navigate(['/']).then(noop);
		}

		this.loginForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, PwdValidatorDirective.validPwd]],
		});
	}

	async submit($event: any): Promise<boolean> {
		$event.stopPropagation();
		if (!this.loginForm.valid) return;
		if (!this.loginForm.valid) return;

		this.loading = true;
		this.errors = [];
		this.loginService.login(this.loginForm.getRawValue() as CreateSessionBody).subscribe(
			(res) => {
				if (res.profile) {
					this.sessionService.openSession(res);
					(this.sessionService.login$ as Subject<any>).next(undefined);
					return this.router.navigate(['']).then(() => (this.loading = false));
				}
			},
			(err) => {
				this.loading = false;
				const errorCode = err.error?.code || err.message || 'unknown-error';

				if (errorCode === 'init-password-required') {
					this.loading = true;
					this.router.navigate(['/password/init'], {}).then(() => (this.loading = false));
				}
				this.errors.push(
					['invalid-credentials', 'account-locked'].includes(errorCode)
						? `commons.form.errors.${errorCode}`
						: 'commons.errors.unknown-error',
				);
			},
		);

		return false;
	}

	reset(): void {
		this.router.navigate(['']);
	}
}
