export enum LoadingBarEventType {
	PROGRESS,
	HEIGHT,
	COLOR,
	VISIBLE,
}

export class LoadingBarEvent {
	constructor(
		public type: LoadingBarEventType,
		public value: boolean | string,
	) {}
}
