import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { PublicConf } from '../../../environments/public-conf.models';

@Injectable()
export class ConfigurationService {
	private readonly conf: PublicConf;
	private conf$: ReplaySubject<PublicConf> = new ReplaySubject(1);

	constructor() {
		this.conf = environment || {};
	}

	public get<T>(key: string): Observable<T> {
		return this.conf$.pipe(
			take(1),
			map((conf) => {
				return _.get(conf, key);
			}),
		);
	}
	public getInstant<T>(key: string): T {
		return _.get(this.conf, key);
	}

	public set(key: keyof PublicConf, value: any): void {
		_.set(this.conf, key, value);
		this.conf$.next(this.conf);
	}
}
