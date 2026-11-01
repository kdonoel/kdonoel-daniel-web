import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AlLinkifyPipe } from '../components/pipes/linkyfy.pipe';
import { Nl2brPipe } from '../components/pipes/nl2br.pipe';
import { SharedModule } from '../components/shared/shared.module';
import { KdoComponent } from './kdo/kdo.component';
import { KdoFormComponent } from './modals/kdo-form.component';
import { UserComponent } from './user.component';

const routes: Routes = [
	{
		path: ':userId',
		component: UserComponent,
	},
	{
		path: ':userId/:kdoIndex',
		component: KdoComponent,
	},
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		SharedModule.forRoot(),
		ModalModule.forRoot(),
		NgSelectModule,
		NgToggleModule,
	],
	providers: [],
	declarations: [Nl2brPipe, AlLinkifyPipe, UserComponent, KdoComponent, KdoFormComponent],
	entryComponents: [KdoFormComponent],
})
export class UsersModule {}
