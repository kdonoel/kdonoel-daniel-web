import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import sweetalert2 from 'sweetalert2';

/**
 * Messages displayed with SweetAlert2.
 * The texts can contain user inputs (titles of the ideas), they are always displayed as text, never as HTML.
 */
@Injectable()
export class SwalService {
	constructor(private translateService: TranslateService) {}

	/**
	 * Short confirmation at the top of the page, closed automatically
	 */
	public toast(key: string, params?: object): void {
		void sweetalert2.fire({
			toast: true,
			position: 'top',
			icon: 'success',
			titleText: this.translateService.instant(key, params),
			showConfirmButton: false,
			timer: 3000,
			timerProgressBar: true,
		});
	}

	/**
	 * Error message, closed by the user
	 */
	public error(key: string, params?: object): void {
		this.alert('error', 'errors.title', key, params);
	}

	/**
	 * Information message, closed by the user
	 */
	public info(titleKey: string, key: string): void {
		this.alert('info', titleKey, key);
	}

	/**
	 * Question answered by the user, resolved with true when confirmed
	 */
	public async confirm(
		titleKey: string,
		key: string,
		confirmKey: string,
		params?: object,
	): Promise<boolean> {
		const result = await sweetalert2.fire({
			icon: 'question',
			titleText: this.translateService.instant(titleKey, params),
			text: this.translateService.instant(key, params),
			showCancelButton: true,
			confirmButtonText: this.translateService.instant(confirmKey),
			cancelButtonText: this.translateService.instant('commons.cancel'),
			// The cancel button on the left, like in the modals of the app
			reverseButtons: true,
		});
		return result.isConfirmed;
	}

	private alert(icon: 'error' | 'info', titleKey: string, key: string, params?: object): void {
		void sweetalert2.fire({
			icon,
			titleText: this.translateService.instant(titleKey),
			text: this.translateService.instant(key, params),
			confirmButtonText: this.translateService.instant('errors.close'),
		});
	}
}
