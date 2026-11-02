export interface PublicConf {
	production?: boolean;
	api?: {
		baseHref?: string;
		ignoredRoutes?: string[];
	};
	name?: string;
}
