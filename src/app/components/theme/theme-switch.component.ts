import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { Theme, ThemeService } from './theme.service';

interface ThemeOption {
	theme: Theme;
	icon: string;
}

@Component({
	selector: 'kdos-theme-switch',
	imports: [AsyncPipe, TranslatePipe],
	template: `
		<div class="btn-group btn-group-sm" role="group" [attr.aria-label]="'footer.theme' | translate">
			@for (option of options; track option.theme) {
				<button
					type="button"
					class="btn btn-outline-secondary"
					[title]="'theme.' + option.theme + '.title' | translate"
					[class.active]="(themeService.theme$ | async) === option.theme"
					[attr.aria-pressed]="(themeService.theme$ | async) === option.theme"
					(click)="setTheme(option.theme)"
				>
					<i class="bi me-1" [class]="option.icon" aria-hidden="true"></i>
					{{ 'theme.' + option.theme + '.label' | translate }}
				</button>
			}
		</div>
	`,
})
export class ThemeSwitchComponent {
	readonly options: ThemeOption[] = [
		{ theme: 'light', icon: 'bi-sun' },
		{ theme: 'auto', icon: 'bi-circle-half' },
		{ theme: 'dark', icon: 'bi-moon-stars' },
	];

	constructor(public themeService: ThemeService) {}

	setTheme(theme: Theme): void {
		this.themeService.setTheme(theme);
	}
}
