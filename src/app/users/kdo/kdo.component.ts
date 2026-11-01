import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Kdo, KdoState } from '../../components/models/users/kdos.models';
import { User } from '../../components/models/users/users.models';
import { SessionService } from '../../components/session/session.service';
import { SelectItems } from '../../components/utils/select-item';
import { SwalService } from '../../components/utils/swal.service';
import { TranslateUtilsService } from '../../components/utils/translate-utils.service';
import { KdoFormComponent } from '../modals/kdo-form.component';
import { UsersService } from '../users.service';

@Component({
	selector: 'al-user',
	templateUrl: 'kdo.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class KdoComponent implements OnInit {
	formStatus: FormGroup;
	kdo: Kdo;
	index: number;
	loading: boolean = true;
	statesItems: SelectItems;

	private userId: string;
	private states: KdoState[] = Object.values(KdoState);

	constructor(
		private route: ActivatedRoute,
		private usersService: UsersService,
		private modalService: BsModalService,
		private translateUtilsService: TranslateUtilsService,
		private fb: FormBuilder,
		private swalService: SwalService,
		private sessionService: SessionService,
	) {
		this.formStatus = this.fb.group({
			status: this.fb.control(undefined),
		});
	}

	ngOnInit(): void {
		this.route.params.subscribe((params) => {
			forkJoin([
				this.translateUtilsService.translateSelectItems('kdo.state.', this.states),
				this.usersService.getUser(params['userId']),
			]).subscribe(([items, user]) => {
				this.statesItems = items;
				this.loading = false;
				this.index = Number.parseInt(params['kdoIndex'], 10);
				this.userId = user._id;
				this.kdo = user.kdos[this.index];
				if (this.kdo.status) {
					this.formStatus.controls['status'].setValue(this.kdo.status.code);
				}
			});
		});
	}

	isConnectedUser(): Observable<boolean> {
		return this.sessionService.session$.pipe(
			map((session) => {
				return !this.loading && this.userId === session.profile._id;
			}),
		);
	}

	edit(): void {
		const modal = this.modalService.show(KdoFormComponent);
		modal.content.onShow(this.userId, this.kdo, this.index);
		modal.content.onChange.subscribe((newUser: User) => {
			this.kdo = newUser.kdos[this.index];
		});
	}

	setKdoStatus(): void {
		if (!this.formStatus.value.status) return;
		this.usersService.setStatus(this.userId, this.index, this.formStatus.value).subscribe(
			() => {
				this.swalService.translateSuccess('kdo.status.edit.confirm.success');
			},
			(errorCode) => {
				this.swalService.translateError('commons.error', `kdo.edit.confirm.error.${errorCode}`);
			},
		);
	}
}
