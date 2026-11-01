import { Directive, forwardRef } from '@angular/core';
import { FormControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
    selector: '[n9-email][ngModel],[n9-email][formControl]',
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => PwdValidatorDirective),
            multi: true,
        },
    ],
    standalone: false
})
export class PwdValidatorDirective implements Validator {
	static validPwd(c: FormControl): ValidationErrors {
		/**
		 * At least one of the following regex must be complete
		 */

		// at least 1 digit && 1 letter
		const regExp = /^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$/i;

		return regExp.test(c.value) ? null : { pwdValid: true };
	}

	validate(c: FormControl): ValidationErrors {
		return PwdValidatorDirective.validPwd(c);
	}
}
