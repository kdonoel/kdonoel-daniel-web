import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { environment } from '../../../environments/environment';
import { PublicConf } from '../../../environments/public-conf.models';

@Injectable()
export class ConfigurationService {
	private readonly conf: PublicConf;

	constructor() {
		this.conf = environment || {};
	}

	public getInstant<T>(key: string): T {
		return _.get(this.conf, key);
	}
}
