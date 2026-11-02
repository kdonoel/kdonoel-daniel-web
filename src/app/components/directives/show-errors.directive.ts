import {
	AfterContentInit,
	ContentChild,
	Directive,
	ElementRef,
	forwardRef,
	Input,
	Optional,
	Renderer2,
	SkipSelf,
} from '@angular/core';
import { AbstractControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { combineLatest, fromEvent, merge, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { FocusableComponent } from './focusable.component';

export type EditActionType = 'create' | 'update';

declare type FormControlStatus = 'INVALID' | 'VALID' | 'DISABLED';
declare type InputFocusStatus = 'untouched' | 'blur' | 'focus' | 'submit';

// todo: add doc
@Directive({
	selector: '[n9ShowErrors]',
	exportAs: 'n9ShowErrors',
	standalone: false,
})
export class ShowErrorsDirective implements AfterContentInit {
	// The form, to display the errors when it is submitted
	@Input() private n9ShowErrors: NgForm | FormGroupDirective;
	@Input() private n9ShowErrorsDisabled: boolean;
	@Input() private errorsTranslationPrefix: string;
	@Input() private displayOnlyOne: boolean = true;

	// if actionType === update then errors will be displayed on directive startup
	@Input() private actionType: EditActionType;

	@ContentChild(NgControl) private control: NgControl;
	@ContentChild(forwardRef(() => FocusableComponent)) private focusItem: FocusableComponent;
	@ContentChild(NgControl, { read: ElementRef }) private inputRef: ElementRef;
	@ContentChild('input', { read: ElementRef }) private input: ElementRef;

	private errorsPlaceholder: any;

	constructor(
		private el: ElementRef,
		private renderer: Renderer2,
		private translateService: TranslateService,
		@SkipSelf()
		@Optional()
		private parentN9ShowErrors: ShowErrorsDirective,
	) {}

	public ngAfterContentInit(): void {
		const actionType =
			this.actionType ||
			(this.parentN9ShowErrors && this.parentN9ShowErrors.actionType) ||
			'create';

		if (this.n9ShowErrorsDisabled) return;

		const statusChanges$ = this.makeStatusChange();
		const focusChange$ = this.makeFocusChange();

		// if actionType !== create we considere all input to be already blured
		// se we display the errors on directive init
		// otherwise we wait for first blur / submit

		combineLatest(
			statusChanges$,
			focusChange$.pipe(startWith(actionType === 'create' ? 'focus' : 'blur')),
		).subscribe(([status, inputState]) =>
			this.onStatusChange(status, inputState as InputFocusStatus),
		);

		if (this.n9ShowErrors && this.n9ShowErrors.ngSubmit) {
			this.n9ShowErrors.ngSubmit.subscribe(() => {
				this.onStatusChange(this.control.status as FormControlStatus, 'submit');
			});
		}
	}

	public hideValidationState(): void {
		this.el.nativeElement.classList.remove('is-invalid');
		this.el.nativeElement.classList.remove('is-valid');
		if (this.errorsPlaceholder) this.errorsPlaceholder.innerHTML = '';
	}

	public displayValidState(): void {
		this.el.nativeElement.classList.add('is-valid');
	}

	public displayErrors(): void {
		if (!this.errorsPlaceholder) {
			this.errorsPlaceholder = this.renderer.createElement('div');
			this.renderer.addClass(this.errorsPlaceholder, 'invalid-feedback');
			this.renderer.addClass(this.errorsPlaceholder, 'd-block');
		}
		this.errorsPlaceholder.innerHTML = '';

		const mappedErrors = _.map(this.getControl().errors, (value, key) => {
			return this.translateService.instant(
				`${this.errorsTranslationPrefix || 'commons.form.errors'}.${key}`,
				_.isObject(value) ? value : {},
			);
		}).filter((t: string) => {
			return !!t;
		});
		const allErrors = this.getControl() ? mappedErrors : [];

		if (this.displayOnlyOne) this.errorsPlaceholder.innerHTML = allErrors[0];
		else this.errorsPlaceholder.innerHTML = allErrors.join('<br />');
		this.getInputNativeElement().parentNode.insertBefore(
			this.errorsPlaceholder,
			this.getInputNativeElement().nextSibling,
		);
	}

	public displayInvalidState(): void {
		this.displayErrors();
		this.el.nativeElement.classList.add('is-invalid');
	}

	public displayInvalidStateWithoutErrors(): void {
		this.el.nativeElement.classList.add('is-invalid');
	}

	public onStatusChange(status: FormControlStatus, inputState: InputFocusStatus): void {
		// console.log('onStatusChange', status, inputState);

		switch (inputState) {
			case 'untouched':
				if (status === 'VALID') {
					this.hideValidationState();
					this.displayValidState();
				} else {
					this.displayInvalidStateWithoutErrors();
				}
				break;

			case 'focus':
				this.hideValidationState();
				break;

			case 'blur':
			case 'submit':
				this.hideValidationState();
				if (status === 'VALID') {
					this.displayValidState();
				} else if (status !== 'DISABLED') {
					this.displayInvalidState();
				}
				break;
		}
	}

	private makeFocusChange(): Observable<InputFocusStatus> {
		// console.log('makeFocusChange', this.focusItem, this.inputRef);
		if (this.focusItem) {
			return this.focusItem.focusChange;
		}
		return merge(
			fromEvent(this.getInputNativeElement(), 'blur').pipe(map((): InputFocusStatus => 'blur')),
			fromEvent(this.getInputNativeElement(), 'focus').pipe(map((): InputFocusStatus => 'focus')),
		);
	}

	private makeStatusChange(): Observable<FormControlStatus> {
		// console.log('makeStatusChange', this.control);
		return this.control.statusChanges.pipe(startWith(this.control.control.status));
	}

	private getControl(): AbstractControl {
		return this.control.control;
	}

	private getInputNativeElement(): any {
		if (this.inputRef) return this.inputRef.nativeElement;
		return this.input.nativeElement;
	}
}
