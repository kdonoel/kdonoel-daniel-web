import { ModuleWithProviders, NgModule } from '@angular/core';

import { ConfigurationService } from './configuration.service';

@NgModule({
	providers: [ConfigurationService],
})
export class ConfigurationModule {
	public static forRoot(): ModuleWithProviders<ConfigurationModule> {
		return {
			ngModule: ConfigurationModule,
			providers: [ConfigurationService],
		};
	}
}
