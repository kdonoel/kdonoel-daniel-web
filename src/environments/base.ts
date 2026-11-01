import { name, version } from '../../package.json';
import { PublicConf } from './public-conf.models';

export default {
	public: {
		production: false,
		app: {
			name,
			version,
		},
		api: {
			baseHref: '/api',
			ignoredRoutes: ['^/assets/.*$', '^http://.*', '^https://.*'],
		},
	} as PublicConf,
};
