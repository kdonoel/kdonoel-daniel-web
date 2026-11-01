import { Component, Input } from '@angular/core';

@Component({
    selector: 'al-disclaimer',
    templateUrl: './disclaimer.component.html',
    styleUrls: ['./disclaimer.component.scss'],
    standalone: false
})
export class DisclaimerComponent {
	@Input('label') label: string = '';
	@Input('type') type: 'info' | 'warn' | 'error' = 'info';
}
