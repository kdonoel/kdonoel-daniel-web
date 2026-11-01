import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { SessionService } from 'src/app/components/session/session.service';
import { Kdo } from '../../components/models/users/kdos.models';
import { User } from '../../components/models/users/users.models';
import { SwalService } from '../../components/utils/swal.service';
import { UsersService } from '../users.service';

@Component({
    selector: 'al-kdo-form',
    templateUrl: 'kdo-form.component.html',
    standalone: false
})
export class KdoFormComponent {
	kdoIndex: number;
	onChange: Subject<User>;
	form: FormGroup;
	modalType: 'edit' | 'new' = 'edit';
	loading: boolean = true;
	kdo: Kdo;
	userId: string;

	constructor(
		private bsModalRef: BsModalRef,
		private fb: FormBuilder,
		private sessionService: SessionService,
		private usersService: UsersService,
		private swalService: SwalService,
	) {
		this.onChange = new Subject<User>();
	}

	onSubmit(): void {
		if (this.modalType === 'new') {
			this.usersService.addKdo(this.userId, this.form.value).subscribe(
				(newUsers) => {
					this.swalService.translateSuccess('kdo.add.confirm.success');
					this.onChange.next(newUsers);
					this.bsModalRef.hide();
				},
				(errorCode) => {
					this.swalService.translateError('commons.error', `kdo.add.confirm.error.${errorCode}`);
				},
			);
		} else {
			this.usersService.editKdo(this.userId, this.kdoIndex, this.form.value).subscribe(
				(newUsers) => {
					this.swalService.translateSuccess('kdo.edit.confirm.success');
					this.onChange.next(newUsers);
					this.bsModalRef.hide();
				},
				(errorCode) => {
					this.swalService.translateError('commons.error', `kdo.edit.confirm.error.${errorCode}`);
				},
			);
		}
	}

	onShow(userId: string, kdo?: Kdo, kdoIndex?: number): void {
		this.kdo = kdo;
		this.userId = userId;
		this.kdoIndex = kdoIndex;

		if (!kdo) {
			this.modalType = 'new';
			kdo = {
				title: '',
			};
		}

		this.form = this.fb.group({
			title: this.fb.control(kdo.title, [Validators.required]),
			description: this.fb.control(kdo.description, []),
		});
		if (
			this.modalType === 'new' &&
			this.userId !== this.sessionService.session$.value.profile._id
		) {
			this.form.addControl('isSurprise', this.fb.control(false));
		}

		this.loading = false;
	}
}
