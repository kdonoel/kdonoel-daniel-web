import { PublicConf } from './public-conf.models';

export default {
	public: {
		production: false,
		api: {
			baseHref: '/api',
			ignoredRoutes: ['^/assets/.*$', '^http://.*', '^https://.*'],
		},
	} as PublicConf,
};
