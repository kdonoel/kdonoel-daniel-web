import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';

import { Theme, ThemeService } from './theme.service';

interface ThemeOption {
	theme: Theme;
	label: string;
	icon: string;
}

@Component({
	selector: 'kdos-theme-switch',
	imports: [AsyncPipe],
	template: `
		<div class="btn-group btn-group-sm" role="group" aria-label="Thème">
			@for (option of options; track option.theme) {
				<button
					type="button"
					class="btn btn-outline-secondary"
					[title]="option.label"
					[class.active]="(themeService.theme$ | async) === option.theme"
					[attr.aria-pressed]="(themeService.theme$ | async) === option.theme"
					(click)="setTheme(option.theme)"
				>
					<i class="bi" [class]="option.icon" aria-hidden="true"></i>
					<span class="visually-hidden">{{ option.label }}</span>
				</button>
			}
		</div>
	`,
})
export class ThemeSwitchComponent {
	readonly options: ThemeOption[] = [
		{ theme: 'light', label: 'Clair', icon: 'bi-sun' },
		{ theme: 'auto', label: 'Automatique', icon: 'bi-circle-half' },
		{ theme: 'dark', label: 'Sombre', icon: 'bi-moon-stars' },
	];

	constructor(public themeService: ThemeService) {}

	setTheme(theme: Theme): void {
		this.themeService.setTheme(theme);
	}
}
