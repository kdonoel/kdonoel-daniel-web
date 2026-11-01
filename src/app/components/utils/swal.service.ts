import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import sweetalert2 from 'sweetalert2';

/**
 * Messages displayed with SweetAlert2.
 * The texts can contain user inputs (titles of the ideas), they are always displayed as text, never as HTML.
 */
@Injectable()
export class SwalService {
	constructor(private injector: Injector) {}

	// Resolved lazily: the HTTP interceptors depend on this service
	private get translateService(): TranslateService {
		return this.injector.get(TranslateService);
	}

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
	public info(titleKey: string, key: string, params?: object): void {
		this.alert('info', titleKey, key, params);
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
