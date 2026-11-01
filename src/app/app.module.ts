import { BrowserModule } from '@angular/platform-browser';

import { CommonModule, registerLocaleData } from '@angular/common';
import {
	HttpBackend,
	HttpClient,
	HTTP_INTERCEPTORS,
	provideHttpClient,
	withInterceptorsFromDi,
	withXhr,
} from '@angular/common/http';
import fr from '@angular/common/locales/fr';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { Angulartics2Module } from 'angulartics2';
import { NgBootstrapDarkmodeModule } from 'ng-bootstrap-darkmode';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoadingBarModule } from './components/angular-components/loading-bar/loading-bar.module';
import { CoreModule } from './components/core/core.module';
import { BaseHrefApiPreInterceptor } from './components/http/base-href-api.pre-interceptor';
import { DefaultHeadersApiPreInterceptor } from './components/http/default-headers-api.pre-interceptor';
import { HandleResponsesErrorPostInterceptor } from './components/http/handle-responses-error.post-interceptor';
import { LoaderInterceptor } from './components/http/loader-interceptor.service';
import { SessionService } from './components/session/session.service';
import { SharedModule } from './components/shared/shared.module';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { UsersService } from './users/users.service';

registerLocaleData(fr);

export function HttpLoaderFactory(httpBackend: HttpBackend): TranslateLoader {
	return new TranslateHttpLoader(new HttpClient(httpBackend), 'assets/translations/', '.json');
}

@NgModule({
	declarations: [AppComponent, HomeComponent, HeaderComponent, FooterComponent],
	entryComponents: [],
	bootstrap: [AppComponent],
	imports: [
		AppRoutingModule,
		CommonModule,
		FormsModule,
		BrowserModule,
		Angulartics2Module.forRoot(),
		BrowserModule,
		BrowserAnimationsModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpBackend],
			},
		}),
		CoreModule,
		SharedModule.forRoot(),
		BsDropdownModule.forRoot(),
		LoadingBarModule,
		NgBootstrapDarkmodeModule,
		NgSelectModule,
		NgToggleModule,
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
	],
})
export class AppModule {}
