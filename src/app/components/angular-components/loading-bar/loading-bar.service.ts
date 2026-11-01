import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';

import { LoadingBarEvent, LoadingBarEventType } from './loading-bar.models';

/**
 * LoadingBar service helps manage Loading bar on the top of screen or parent component
 */
@Injectable()
export class LoadingBarService {
	public interval: number = 500; // in milliseconds
	public events: Observable<LoadingBarEvent>;

	private _progress: number = 0;
	private _height: string = '2px';
	private _color: string = 'firebrick';
	private _visible: boolean = true;

	private _intervalCounterId: number = 0;
	private _timeoutStartId: number = 0;
	private eventSource: Subject<LoadingBarEvent>;

	constructor() {
		this.eventSource = new Subject<LoadingBarEvent>();
		this.events = this.eventSource.asObservable();
	}

	set progress(value: number) {
		if (!_.isNil(value)) {
			if (value > 0) {
				this.visible = true;
			}
			this._progress = value;
			this.emitEvent(new LoadingBarEvent(LoadingBarEventType.PROGRESS, this._progress.toString()));
		}
	}

	get progress(): number {
		return this._progress;
	}

	set height(value: string) {
		if (!_.isNil(value)) {
			this._height = value;
			this.emitEvent(new LoadingBarEvent(LoadingBarEventType.HEIGHT, this._height));
		}
	}

	get height(): string {
		return this._height;
	}

	set color(value: string) {
		if (!_.isNil(value)) {
			this._color = value;
			this.emitEvent(new LoadingBarEvent(LoadingBarEventType.COLOR, this._color));
		}
	}

	get color(): string {
		return this._color;
	}

	set visible(value: boolean) {
		if (!_.isNil(value)) {
			this._visible = value;
			this.emitEvent(new LoadingBarEvent(LoadingBarEventType.VISIBLE, this._visible));
		}
	}

	get visible(): boolean {
		return this._visible;
	}

	start(): void {
		// Stop current timer
		this.stop();
		// Make it visible for sure

		this._timeoutStartId = window.setTimeout(() => {
			this.visible = true;
			this.progress = 5;
			// Run the timer with milliseconds iterval
			this._intervalCounterId = window.setInterval(() => {
				// Increment the progress and update view component
				this.progress += 1;
				// If the progress is 100% - call complete
				if (this.progress === 100) {
					this.stop();
				}
			}, this.interval);
		}, 100);
	}

	stop(): void {
		if (this._timeoutStartId) {
			clearTimeout(this._timeoutStartId);
			this._timeoutStartId = null;
		}
		if (this._intervalCounterId) {
			clearInterval(this._intervalCounterId);
			this._intervalCounterId = null;
		}
	}

	reset(): void {
		this.stop();
		this.progress = 0;
	}

	complete(): void {
		if (this.visible) {
			this.progress = 100;
			this.stop();
			setTimeout(() => {
				// Hide it away
				this.visible = false;
				setTimeout(() => {
					// Drop to 0
					this.progress = 0;
				}, 250);
			}, 250);
		} else {
			this.stop();
			this.progress = 0;
		}
	}

	private emitEvent(event: LoadingBarEvent): void {
		if (this.eventSource) {
			// Push up a new event
			this.eventSource.next(event);
		}
	}
}
