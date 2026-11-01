import { Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import sweetalert2 from 'sweetalert2';

/**
 *
 * Can't use sweetalert2 types due to errors on build with typescript :
 * Cannot read property 'kind' of undefined
 *  at backoffice/node_modules/typescript/lib/typescript.js:2569:166
 *
 *  https://github.com/microsoft/TypeScript/pull/44378
 */
@Injectable()
export class SwalService {
	public static empty: string = 'empty.empty';

	public static success(title: string, description: string = '', timer: number = 1000): void {
		void sweetalert2.fire({
			title,
			timer,
			text: description,
			icon: 'success',
			showConfirmButton: false,
		});
	}

	public static warning(title: string, description: string = '', timer: number = 1000): void {
		void sweetalert2.fire({
			title,
			timer,
			text: description,
			icon: 'warning',
			showConfirmButton: false,
		});
	}

	public static error(title: string, description: string = ''): void {
		void sweetalert2.fire(title, description, 'error');
	}

	public static info(
		title: string,
		description: string = '',
		allowOutsideClick: boolean = true,
		allowEscapeKey: boolean = true,
	): void {
		void sweetalert2.fire({
			title,
			allowOutsideClick,
			allowEscapeKey,
			text: description,
			showConfirmButton: true,
			showCancelButton: false,
		});
	}

	public static confirm(
		title: string,
		description: string = '',
		options: object = {},
	): Promise<any> {
		return sweetalert2.fire({
			title,
			text: description,
			icon: 'warning',
			showCancelButton: true,
			cancelButtonText: 'Non',
			confirmButtonText: 'Oui',
			...options,
		});
	}

	public static input(title: string, description: string = '', options: object = {}): Promise<any> {
		return sweetalert2.fire({
			title,
			text: description,
			input: 'text',
			showCancelButton: true,
			cancelButtonText: 'Annuler',
			confirmButtonText: 'Valider',
			...options,
		});
	}

	private translateService!: TranslateService;

	constructor(private injector: Injector) {
		setTimeout(() => {
			this.translateService = this.injector.get(TranslateService);
		});
	}

	public translateSuccess(
		title: string,
		description: string = SwalService.empty,
		titleParams?: object,
		descriptionParams?: object,
		timer: number = 1000,
	): void {
		forkJoin([
			this.translateService.get(title, titleParams),
			this.translateService.get(description, descriptionParams),
		]).subscribe(([titleTranslated, descriptionTranslated]) => {
			SwalService.success(titleTranslated, descriptionTranslated, timer);
		});
	}

	public translateWarning(
		title: string,
		description: string = SwalService.empty,
		titleParams?: object,
		descriptionParams?: object,
		timer: number = 1000,
	): void {
		forkJoin([
			this.translateService.get(title, titleParams),
			this.translateService.get(description, descriptionParams),
		]).subscribe(([titleTranslated, descriptionTranslated]) => {
			SwalService.warning(titleTranslated, descriptionTranslated, timer);
		});
	}

	public translateError(title: string, description: string = SwalService.empty): void {
		forkJoin([this.translateService.get(title), this.translateService.get(description)]).subscribe(
			([titleTranslated, descriptionTranslated]) => {
				SwalService.error(titleTranslated, descriptionTranslated);
			},
		);
	}

	public translateInfo(
		title: string,
		description: string = SwalService.empty,
		allowOutsideClick: boolean = true,
		allowEscapeKey: boolean = true,
	): void {
		forkJoin([this.translateService.get(title), this.translateService.get(description)]).subscribe(
			([titleTranslated, descriptionTranslated]) => {
				SwalService.info(titleTranslated, descriptionTranslated, allowOutsideClick, allowEscapeKey);
			},
		);
	}

	public translateConfirm(
		title: string,
		description: string = SwalService.empty,
		titleParams?: object,
		descriptionParams?: object,
		options: object = {},
	): Observable<any> {
		return forkJoin([
			this.translateService.get(title, titleParams),
			this.translateService.get(description, descriptionParams),
		]).pipe(
			mergeMap(([titleTranslated, descriptionTranslated]) => {
				return from(
					SwalService.confirm(titleTranslated as string, descriptionTranslated as string, options),
				);
			}),
		);
	}

	public translateInput(
		title: string,
		description: string = SwalService.empty,
		options: object = {},
	): Observable<any> {
		return forkJoin([
			this.translateService.get(title),
			this.translateService.get(description),
		]).pipe(
			mergeMap(([titleTranslated, descriptionTranslated]) => {
				return from(SwalService.input(titleTranslated, descriptionTranslated, options));
			}),
		);
	}
}
