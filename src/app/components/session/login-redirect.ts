import { Params, Router } from '@angular/router';

/**
 * Only a page of the app can be opened after the login, never another site
 */
export function isSafeReturnUrl(url: unknown): url is string {
	return (
		typeof url === 'string' &&
		url.startsWith('/') &&
		!url.startsWith('//') &&
		!url.includes('\\') &&
		!url.startsWith('/login') &&
		!url.startsWith('/password')
	);
}

/**
 * Query params of the login page to come back to the current page once logged in
 */
export function getLoginQueryParams(returnUrl: string): Params {
	return isSafeReturnUrl(returnUrl) && returnUrl !== '/' ? { returnUrl } : {};
}

export function navigateToLogin(
	router: Router,
	returnUrl: string,
	sessionExpired: boolean = false,
): Promise<boolean> {
	return router.navigate(['/login'], {
		queryParams: getLoginQueryParams(returnUrl),
		state: { sessionExpired },
	});
}
