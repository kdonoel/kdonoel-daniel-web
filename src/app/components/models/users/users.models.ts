import { Kdo } from './kdos.models';

export interface User {
	_id: string;
	token?: string;
	email: string;

	firstName: string;
	lastName: string;

	updatedAt?: Date;

	createdAt?: Date;
	lastSessionAt?: Date;
	accessToken?: string;

	kdos?: Kdo[];
	kdosCount?: number;
	familyCodes?: string[];
	// Only for the user itself, missing with the former API
	hasPassword?: boolean;
}
