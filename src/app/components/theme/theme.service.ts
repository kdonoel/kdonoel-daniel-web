import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, fromEvent, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export type Theme = 'light' | 'dark' | 'auto';

/**
 * Apply the Bootstrap color mode (data-bs-theme attribute) chosen by the user.
 * The choice is saved in the local storage with the same key as the former ng-bootstrap-darkmode library,
 * without any choice the theme follows the system preference.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
	private static readonly storageKey: string = 'theme';

	public readonly theme$: BehaviorSubject<Theme> = new BehaviorSubject(ThemeService.loadTheme());

	constructor(@Inject(DOCUMENT) private document: Document) {
		combineLatest([this.theme$, this.getPreferredColorScheme()]).subscribe(
			([theme, preferredColorScheme]) => {
				this.document.documentElement.setAttribute(
					'data-bs-theme',
					theme === 'auto' ? preferredColorScheme : theme,
				);
			},
		);
	}

	private static loadTheme(): Theme {
		const theme = localStorage.getItem(ThemeService.storageKey);
		return theme === 'light' || theme === 'dark' ? theme : 'auto';
	}

	public setTheme(theme: Theme): void {
		localStorage.setItem(ThemeService.storageKey, theme);
		this.theme$.next(theme);
	}

	private getPreferredColorScheme(): Observable<'light' | 'dark'> {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		return fromEvent<MediaQueryListEvent>(mediaQuery, 'change').pipe(
			map((event) => event.matches),
			startWith(mediaQuery.matches),
			map((matches) => (matches ? 'dark' : 'light')),
		);
	}
}
