import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../components/shared/shared.module';
import { LoginComponent } from './login.component';
import { LoginService } from './login.service';
import { LoginLinkComponent } from './login-link.component';

const routes: Routes = [
	{ path: '', component: LoginComponent },
	// Opened by the links sent by email
	{ path: 'link', component: LoginLinkComponent },
];

@NgModule({
	imports: [FormsModule, RouterModule.forChild(routes), CommonModule, SharedModule],
	declarations: [LoginComponent, LoginLinkComponent],
	providers: [LoginService],
})
export class LoginModule {}
