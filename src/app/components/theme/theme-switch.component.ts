import { ChangeDetectionStrategy, Component } from '@angular/core';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeOption {
	theme: Theme;
	icon: string;
}

// Same key as the former ng-bootstrap-darkmode library, so that the users keep their choice
const STORAGE_KEY = 'theme';

/**
 * Apply the Bootstrap color mode (data-bs-theme attribute) chosen by the user, without any choice the theme
 * follows the system preference. index.html applies the same rule before the app starts, to avoid a flash.
 */
@Component({
	selector: 'kdos-theme-switch',
	template: `
		<div class="btn-group btn-group-sm" role="group" [attr.aria-label]="'footer.theme' | translate">
			@for (option of options; track option.theme) {
				<button
					type="button"
					class="btn btn-outline-secondary"
					[title]="'theme.' + option.theme + '.title' | translate"
					[class.active]="theme === option.theme"
					[attr.aria-pressed]="theme === option.theme"
					(click)="setTheme(option.theme)"
				>
					<i class="bi me-1" [class]="option.icon" aria-hidden="true"></i>
					{{ 'theme.' + option.theme + '.label' | translate }}
				</button>
			}
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class ThemeSwitchComponent {
	readonly options: ThemeOption[] = [
		{ theme: 'light', icon: 'bi-sun' },
		{ theme: 'auto', icon: 'bi-circle-half' },
		{ theme: 'dark', icon: 'bi-moon-stars' },
	];
	theme: Theme;

	private readonly darkScheme: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

	constructor() {
		const savedTheme = localStorage.getItem(STORAGE_KEY);
		this.theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'auto';
		this.darkScheme.addEventListener('change', () => this.applyTheme());
	}

	setTheme(theme: Theme): void {
		localStorage.setItem(STORAGE_KEY, theme);
		this.theme = theme;
		this.applyTheme();
	}

	private applyTheme(): void {
		const isDark = this.theme === 'auto' ? this.darkScheme.matches : this.theme === 'dark';
		document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
	}
}
