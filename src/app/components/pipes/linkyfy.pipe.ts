import { Pipe, PipeTransform } from '@angular/core';
import linkifyStr from "linkify-string";

@Pipe({
    name: 'alLinkify',
    standalone: false
})
export class AlLinkifyPipe implements PipeTransform {
	transform(str: string): string {
		return str ? linkifyStr(str, { target: '_blanck' }) : str;
	}
}
