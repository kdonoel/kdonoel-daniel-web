import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../components/shared/shared.module';
import { InitPasswordComponent } from './init-password.component';
import { PasswordService } from './password.service';

const routes: Routes = [{ path: 'init', component: InitPasswordComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes), CommonModule, SharedModule],
	providers: [PasswordService],
	declarations: [InitPasswordComponent],
})
export class PasswordModule {}
