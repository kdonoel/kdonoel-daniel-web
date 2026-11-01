import * as _ from 'lodash';

import base from './base';
import { PublicConf } from './public-conf.models';

export const environment = _.merge({}, base.public, {
	name: 'prod',
	api: {
		baseHref: '/api',
	},
} as PublicConf);
