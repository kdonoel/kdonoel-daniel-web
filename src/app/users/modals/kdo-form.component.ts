import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	OnInit,
	ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Kdo } from '../../components/models/users/kdos.models';
import { User } from '../../components/models/users/users.models';
import { SwalService } from '../../components/utils/swal.service';
import { UsersService } from '../users.service';

// A title made of spaces is empty
function notBlank(control: AbstractControl): ValidationErrors | null {
	return `${control.value ?? ''}`.trim() ? null : { required: true };
}

/**
 * Add an idea to a list or edit one, opened in a modal
 */
@Component({
	selector: 'kdos-kdo-form',
	templateUrl: 'kdo-form.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class KdoFormComponent implements OnInit, AfterViewInit {
	// Set through the initial state of the modal: the owner of the list and the edited idea
	user: User;
	isOwnList: boolean;
	kdo?: Kdo;
	kdoIndex?: number;

	readonly saved: Subject<void> = new Subject<void>();
	form: FormGroup;
	titleKey: string;
	saving: boolean = false;

	@ViewChild('titleInput') private titleInput: ElementRef<HTMLInputElement>;

	constructor(
		private bsModalRef: BsModalRef,
		private fb: FormBuilder,
		private usersService: UsersService,
		private swalService: SwalService,
	) {}

	ngOnInit(): void {
		if (this.kdo) {
			this.titleKey = 'kdoForm.title.edit';
		} else {
			this.titleKey = this.isOwnList ? 'kdoForm.title.newOwn' : 'kdoForm.title.newOther';
		}

		this.form = this.fb.group({
			title: [this.kdo?.title ?? '', [notBlank]],
			description: [this.kdo?.description ?? ''],
		});
		// An idea added to the list of someone else is a surprise by default
		if (!this.kdo && !this.isOwnList) {
			this.form.addControl('isSurprise', this.fb.control(true));
		}
	}

	ngAfterViewInit(): void {
		// The modal takes the focus when it opens
		setTimeout(() => this.titleInput?.nativeElement.focus());
	}

	close(): void {
		this.bsModalRef.hide();
	}

	onSubmit(): void {
		if (this.form.invalid) {
			this.titleInput?.nativeElement.focus();
			return;
		}

		const kdo: Kdo = {
			...this.form.value,
			title: this.form.value.title.trim(),
			description: this.form.value.description?.trim(),
		};
		const request = this.kdo
			? this.usersService.editKdo(this.user._id, this.kdoIndex, kdo)
			: this.usersService.addKdo(this.user._id, kdo);

		this.saving = true;
		request.pipe(finalize(() => (this.saving = false))).subscribe(() => {
			this.swalService.toast(this.kdo ? 'kdoForm.toast.edited' : 'kdoForm.toast.added');
			this.saved.next();
			this.close();
		});
	}
}
