import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoggedInGuard } from './components/session/logged-in.guard';
import { HomeComponent } from './home/home.component';
import { LoginModule } from './login/login.module';
import { PasswordModule } from './password/password.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { UsersModule } from './users/users.module';

const routes: Routes = [
	{ path: '', component: HomeComponent, pathMatch: 'full' },
	{ path: 'login', loadChildren: () => LoginModule },
	{
		path: 'password',
		loadChildren: () => PasswordModule,
	},
	{
		path: 'profile',
		loadChildren: () => UserProfileModule,
		canActivate: [LoggedInGuard],
	},
	{
		path: 'users',
		loadChildren: () => UsersModule,
		canActivate: [LoggedInGuard],
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { enableTracing: false })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
