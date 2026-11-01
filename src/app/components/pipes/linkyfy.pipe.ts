import { Pipe, PipeTransform } from '@angular/core';
import linkifyStr from 'linkify-string';

/**
 * Name of the site instead of the whole address, which can be very long: "amazon.fr"
 */
function formatLink(value: string, type: string): string {
	if (type !== 'url') return value;
	try {
		return new URL(/^[a-z]+:\/\//i.test(value) ? value : `https://${value}`).hostname.replace(
			/^www\./,
			'',
		);
	} catch {
		return value;
	}
}

/**
 * Turn the links of a text into HTML links. The text is escaped by linkify.
 */
@Pipe({
	name: 'alLinkify',
	standalone: false,
})
export class AlLinkifyPipe implements PipeTransform {
	transform(str: string): string {
		return str
			? linkifyStr(str, {
					target: '_blank',
					rel: 'noopener noreferrer',
					className: 'link-external',
					format: formatLink,
					// The whole address is still displayed on hover
					attributes: (href: string) => ({ title: href }),
				})
			: str;
	}
}
