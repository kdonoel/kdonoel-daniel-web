import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';

import { Theme, ThemeService } from './theme.service';

@Component({
	selector: 'kdos-theme-switch',
	imports: [AsyncPipe],
	template: `
		<div class="btn-group" role="group" aria-label="Thème">
			<button
				type="button"
				class="btn btn-light"
				title="Clair"
				[class.active]="(themeService.theme$ | async) === 'light'"
				(click)="setTheme('light')"
			>
				<i class="fa fa-sun-o" aria-hidden="true"></i>
				<span class="visually-hidden">Clair</span>
			</button>
			<button
				type="button"
				class="btn btn-secondary"
				title="Automatique"
				[class.active]="(themeService.theme$ | async) === 'auto'"
				(click)="setTheme('auto')"
			>
				<i class="fa fa-adjust" aria-hidden="true"></i>
				<span class="visually-hidden">Automatique</span>
			</button>
			<button
				type="button"
				class="btn btn-dark"
				title="Sombre"
				[class.active]="(themeService.theme$ | async) === 'dark'"
				(click)="setTheme('dark')"
			>
				<i class="fa fa-moon-o" aria-hidden="true"></i>
				<span class="visually-hidden">Sombre</span>
			</button>
		</div>
	`,
})
export class ThemeSwitchComponent {
	constructor(public themeService: ThemeService) {}

	setTheme(theme: Theme): void {
		this.themeService.setTheme(theme);
	}
}
