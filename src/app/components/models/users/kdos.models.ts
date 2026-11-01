export enum KdoState {
	FREE = 'free',
	RESERVED = 'reserved',
	BOUGHT = 'bought',
}

export class KdoStatus {
	public code: KdoState;
	public userId?: string;
	public lastUpdateDate?: Date;
}

export class Kdo {
	public title: string;
	public description?: string;
	public status?: KdoStatus;
	public isSurprise?: boolean;
}
