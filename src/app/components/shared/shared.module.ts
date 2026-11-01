import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { DisclaimerComponent } from '../angular-components/disclaimers/disclaimer.component';
import { LoadingComponent } from '../angular-components/loading/loading.component';
import { FocusableComponent } from '../directives/focusable.component';
import { HeightEqualizerDirective } from '../directives/height-equalizer.directive';
import { ShowErrorsDirective } from '../directives/show-errors.directive';

/*
 * Here put all the shared directives, components and pipe
 * You should import this module in every module where you want to use these shared directives
 * */
@NgModule({
	imports: [ReactiveFormsModule, TranslateModule, FormsModule, CommonModule],
	declarations: [
		ShowErrorsDirective,
		FocusableComponent,
		HeightEqualizerDirective,
		LoadingComponent,
		DisclaimerComponent,
	],
	exports: [
		ShowErrorsDirective,
		FocusableComponent,
		HeightEqualizerDirective,
		ReactiveFormsModule,
		TranslateModule,
		LoadingComponent,
		DisclaimerComponent,
	],
})
export class SharedModule {
	static forRoot(): ModuleWithProviders<SharedModule> {
		return {
			ngModule: SharedModule,
		};
	}
}
