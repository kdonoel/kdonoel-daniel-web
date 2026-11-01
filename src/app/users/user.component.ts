import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { getErrorCode, getErrorMessageKey } from '../components/http/http-errors';
import { Kdo, KdoState } from '../components/models/users/kdos.models';
import { User } from '../components/models/users/users.models';
import { SessionService } from '../components/session/session.service';
import { withPrepositionDe } from '../components/utils/french.util';
import { SwalService } from '../components/utils/swal.service';
import { KdoFormComponent } from './modals/kdo-form.component';
import { UsersService } from './users.service';

/**
 * The owner of a list sees neither the statuses nor the surprises, the others see who reserved an idea:
 * only themselves, the others stay anonymous
 */
export type KdoViewState =
	'own' | 'free' | 'reservedByMe' | 'boughtByMe' | 'reservedByOther' | 'boughtByOther';

export interface KdoView {
	kdo: Kdo;
	// Position of the idea in the list returned by the API, used to edit it or change its status
	index: number;
	state: KdoViewState;
}

interface KdoStateStyle {
	icon: string;
	badge: string;
}

@Component({
	selector: 'al-user',
	templateUrl: 'user.component.html',
	styleUrls: ['user.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class UserComponent implements OnInit, OnDestroy {
	readonly KdoState: typeof KdoState = KdoState;
	readonly stateStyles: Record<Exclude<KdoViewState, 'own'>, KdoStateStyle> = {
		free: { icon: 'bi-check-circle', badge: 'bg-success-subtle text-success-emphasis' },
		reservedByMe: {
			icon: 'bi-bookmark-check-fill',
			badge: 'bg-warning-subtle text-warning-emphasis',
		},
		boughtByMe: { icon: 'bi-bag-check-fill', badge: 'bg-primary-subtle text-primary-emphasis' },
		reservedByOther: { icon: 'bi-lock-fill', badge: 'bg-secondary-subtle text-secondary-emphasis' },
		boughtByOther: { icon: 'bi-lock-fill', badge: 'bg-secondary-subtle text-secondary-emphasis' },
	};

	user: User;
	kdos: KdoView[] = [];
	isConnectedUser: boolean;
	// "de Benjamin" or "d'Alice"
	ofName: string;
	loading: boolean = true;
	// Index of the idea whose status is changing, the actions are disabled meanwhile
	pendingIndex: number;

	private currentUserId: string;
	private subscription: Subscription;

	constructor(
		private route: ActivatedRoute,
		private usersService: UsersService,
		private modalService: BsModalService,
		private sessionService: SessionService,
		private swalService: SwalService,
	) {}

	ngOnInit(): void {
		this.currentUserId = this.sessionService.session$.getValue()?.profile._id;
		this.subscription = this.route.params
			.pipe(
				switchMap((params) => {
					this.loading = true;
					this.user = undefined;
					return this.usersService
						.getUser(params['userId'])
						.pipe(finalize(() => (this.loading = false)));
				}),
			)
			.subscribe((user) => {
				this.setUser(user);
				this.openKdoFormIfRequested();
			});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}

	canEdit(view: KdoView): boolean {
		return view.state !== 'reservedByOther' && view.state !== 'boughtByOther';
	}

	openKdoForm(view?: KdoView): void {
		const modal = this.modalService.show(KdoFormComponent, {
			initialState: { user: this.user, kdo: view?.kdo, kdoIndex: view?.index },
			class: 'modal-dialog-centered',
			// Avoid losing what was typed with a click next to the modal
			ignoreBackdropClick: true,
		});
		modal.content?.saved.subscribe(() => this.reload());
	}

	setStatus(view: KdoView, status: KdoState): void {
		this.pendingIndex = view.index;
		this.usersService
			.setStatus(this.user._id, view.index, { status })
			.pipe(
				switchMap(() => this.usersService.getUser(this.user._id)),
				finalize(() => (this.pendingIndex = undefined)),
			)
			.subscribe({
				next: (user) => {
					this.setUser(user);
					this.swalService.toast(`list.toast.${status}`, { title: view.kdo.title });
				},
				error: (error: HttpErrorResponse) => {
					// Not really an error: someone else was faster
					if (getErrorCode(error) === 'can-t-update-status') {
						this.swalService.info('list.tooLate', getErrorMessageKey(error));
					} else {
						this.swalService.error(getErrorMessageKey(error));
					}
					this.reload();
				},
			});
	}

	private reload(): void {
		this.usersService.getUser(this.user._id).subscribe((user) => this.setUser(user));
	}

	private setUser(user: User): void {
		this.user = user;
		this.isConnectedUser = user._id === this.currentUserId;
		this.ofName = withPrepositionDe(user.firstName);
		this.kdos = (user.kdos ?? [])
			.map((kdo, index) => ({ kdo, index, state: this.getState(kdo) }))
			.filter((view) => !!view.kdo);
	}

	private getState(kdo: Kdo): KdoViewState {
		if (this.isConnectedUser) return 'own';
		const code = kdo?.status?.code;
		if (!code || code === KdoState.FREE) return 'free';

		const isMine = kdo.status.userId === this.currentUserId;
		if (code === KdoState.BOUGHT) return isMine ? 'boughtByMe' : 'boughtByOther';
		return isMine ? 'reservedByMe' : 'reservedByOther';
	}

	// "Ajouter une idée" on the home page opens the form on the list
	private openKdoFormIfRequested(): void {
		if (!history.state?.addKdo) return;
		history.replaceState({ ...history.state, addKdo: undefined }, '');
		this.openKdoForm();
	}
}
