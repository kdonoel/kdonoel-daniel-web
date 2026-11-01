import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SelectItems } from './select-item';

@Injectable()
export class TranslateUtilsService {
	constructor(private translateService: TranslateService) {}

	translateSelectItems(
		prefix: string,
		keys: string[],
		sufix: string = '',
	): Observable<SelectItems> {
		if (!keys) return;

		return this.translateService.get(prefix + keys[0] + sufix).pipe(
			map(() => {
				return keys.map((key) => {
					return {
						id: key,
						label: this.translateService.instant(prefix + key + sufix),
					};
				});
			}),
		);
	}
}
