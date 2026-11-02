import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlLinkifyPipe } from '../components/pipes/linkyfy.pipe';
import { Nl2brPipe } from '../components/pipes/nl2br.pipe';
import { SharedModule } from '../components/shared/shared.module';
import { KdoFormComponent } from './modals/kdo-form.component';
import { UserComponent } from './user.component';

const routes: Routes = [
	{
		path: ':userId',
		component: UserComponent,
	},
	{
		// The ideas used to have their own page, they are now displayed in the list
		path: ':userId/:kdoIndex',
		redirectTo: ':userId',
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes), CommonModule, SharedModule.forRoot()],
	declarations: [Nl2brPipe, AlLinkifyPipe, UserComponent, KdoFormComponent],
})
export class UsersModule {}
