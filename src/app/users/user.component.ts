import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';

import { Kdo } from '../components/models/users/kdos.models';
import { User } from '../components/models/users/users.models';
import { SessionService } from '../components/session/session.service';
import { KdoFormComponent } from './modals/kdo-form.component';
import { UsersService } from './users.service';

@Component({
	selector: 'al-user',
	templateUrl: 'user.component.html',
	styleUrls: ['user.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class UserComponent implements OnInit {
	public user!: User;
	public isConnectedUser: boolean;
	loading: boolean = true;
	currentUserId: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private usersService: UsersService,
		private modalService: BsModalService,
		private sessionService: SessionService,
	) {}

	ngOnInit(): void {
		this.route.params.subscribe((params) => {
			const session = this.sessionService.session$.getValue();
			if (session) {
				this.usersService.getUser(params['userId']).subscribe((user) => {
					this.loading = false;
					this.user = user;
					this.isConnectedUser = session?.profile._id === params['userId'];
					this.currentUserId = session?.profile._id;
				});
			}
		});
	}

	addKdo(): void {
		const modal = this.modalService.show(KdoFormComponent);
		modal.content?.onShow(this.user._id);
		modal.content?.onChange.subscribe((newUser: User) => {
			this.user = newUser;
		});
	}

	edit(kdo: Kdo, index: number): void {
		const modal = this.modalService.show(KdoFormComponent);
		modal.content?.onShow(this.user._id, kdo, index);
		modal.content?.onChange.subscribe((newUser: User) => {
			this.user = newUser;
		});
	}

	showKdo(index: number): void {
		this.router.navigate([index], {
			relativeTo: this.route,
		});
	}
}
