import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector: 'al-disclaimer',
	templateUrl: './disclaimer.component.html',
	styleUrls: ['./disclaimer.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class DisclaimerComponent {
	@Input('label') label: string = '';
	@Input('type') type: 'info' | 'warn' | 'error' = 'info';
}
