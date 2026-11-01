import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlLinkifyPipe } from '../components/pipes/linkyfy.pipe';
import { Nl2brPipe } from '../components/pipes/nl2br.pipe';
import { SharedModule } from '../components/shared/shared.module';
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
	providers: [],
	declarations: [Nl2brPipe, AlLinkifyPipe, UserComponent],
})
export class UsersModule {}
