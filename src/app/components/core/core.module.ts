import { NgModule, Optional, SkipSelf } from '@angular/core';

import { ConfigurationModule } from '../conf/configuration.module';
import { LoggedInGuard } from '../session/logged-in.guard';
import { SessionService } from '../session/session.service';
import { SwalService } from '../utils/swal.service';
import { TranslateUtilsService } from '../utils/translate-utils.service';
import { WindowRefService } from '../window/window-ref.service';

/**
 * This is the "core" module. It aggregates all custom made services.
 * This module should only be imported in the root module.
 */
@NgModule({
	imports: [ConfigurationModule.forRoot()],
	providers: [WindowRefService, SessionService, LoggedInGuard, SwalService, TranslateUtilsService],
})
export class CoreModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
		if (parentModule) {
			throw new Error(
				'CoreModule has already been loaded. Import Core modules in the AppModule only.',
			);
		}
	}
}
