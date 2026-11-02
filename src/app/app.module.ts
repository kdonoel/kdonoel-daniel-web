import { CommonModule, registerLocaleData } from '@angular/common';
import {
	HTTP_INTERCEPTORS,
	provideHttpClient,
	withInterceptorsFromDi,
	withXhr,
} from '@angular/common/http';
import fr from '@angular/common/locales/fr';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { Angulartics2Module } from 'angulartics2';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoadingBarModule } from './components/angular-components/loading-bar/loading-bar.module';
import { CoreModule } from './components/core/core.module';
import { BaseHrefApiPreInterceptor } from './components/http/base-href-api.pre-interceptor';
import { DefaultHeadersApiPreInterceptor } from './components/http/default-headers-api.pre-interceptor';
import { HandleResponsesErrorPostInterceptor } from './components/http/handle-responses-error.post-interceptor';
import { LoaderInterceptor } from './components/http/loader-interceptor.service';
import { SessionService } from './components/session/session.service';
import { SharedModule } from './components/shared/shared.module';
import { ThemeSwitchComponent } from './components/theme/theme-switch.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { UsersService } from './users/users.service';

registerLocaleData(fr);

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		HeaderComponent,
		FooterComponent,
		ThemeSwitchComponent,
	],
	bootstrap: [AppComponent],
	imports: [
		AppRoutingModule,
		CommonModule,
		FormsModule,
		BrowserModule,
		Angulartics2Module.forRoot(),
		CoreModule,
		SharedModule.forRoot(),
		LoadingBarModule,
	],
	providers: [
		{
			provide: LOCALE_ID,
			useValue: 'fr-FR',
		},
		{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: BaseHrefApiPreInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: DefaultHeadersApiPreInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: HandleResponsesErrorPostInterceptor, multi: true },
		UsersService,
		SessionService,
		provideHttpClient(withXhr(), withInterceptorsFromDi()),
		provideTranslateService({
			// Translations are loaded with the HTTP backend to bypass the API interceptors
			loader: provideTranslateHttpLoader({
				prefix: 'assets/translations/',
				suffix: '.json',
				useHttpBackend: true,
			}),
		}),
	],
})
export class AppModule {}
