import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../components/shared/shared.module';
import { LoginComponent } from './login.component';
import { LoginService } from './login.service';

const routes: Routes = [{ path: '', component: LoginComponent }];

@NgModule({
	imports: [FormsModule, RouterModule.forChild(routes), CommonModule, SharedModule],
	declarations: [LoginComponent],
	providers: [LoginService],
})
export class LoginModule {}
