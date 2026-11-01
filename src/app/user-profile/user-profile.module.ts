import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../components/shared/shared.module';
import { PasswordService } from '../password/password.service';
import { UserProfileComponent } from './user-profile.component';

const routes: Routes = [{ path: '', component: UserProfileComponent }];

@NgModule({
	declarations: [UserProfileComponent],
	imports: [RouterModule.forChild(routes), CommonModule, SharedModule, FormsModule],
	providers: [PasswordService],
})
export class UserProfileModule {}
