import { HttpErrorResponse } from '@angular/common/http';

// Codes of the API errors with a dedicated message, see errors.codes in the translations
const KNOWN_ERROR_CODES: string[] = [
	'account-locked',
	'can-t-update-status',
	'invalid-credentials',
	'kdo-not-found',
	'password-already-set',
	'user-already-exists',
	'user-not-found',
	'user-not-valid',
	'wrong-family',
];

// The JWT is expired or no longer valid, for instance when the secret of the API changed
const SESSION_ERROR_CODES: string[] = ['invalid-algorithm', 'invalid-signature', 'invalid-token'];

export function getErrorCode(error: HttpErrorResponse): string | undefined {
	return typeof error.error?.code === 'string' ? error.error.code : undefined;
}

export function isSessionError(error: HttpErrorResponse): boolean {
	const code = getErrorCode(error);
	return (
		error.status === 401 &&
		!!code &&
		(code.startsWith('jwt-') || SESSION_ERROR_CODES.includes(code))
	);
}

/**
 * Translation key of the message explaining the error to the user
 */
export function getErrorMessageKey(error: HttpErrorResponse): string {
	const code = getErrorCode(error);
	if (KNOWN_ERROR_CODES.includes(code)) return `errors.codes.${code}`;
	if (error.status === 0) return 'errors.network';
	if (error.status >= 500) return 'errors.server';
	if ([400, 401, 403, 404, 409].includes(error.status)) return `errors.http.${error.status}`;
	return 'errors.unknown';
}
