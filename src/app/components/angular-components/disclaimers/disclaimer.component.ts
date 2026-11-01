import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'al-disclaimer',
	templateUrl: './disclaimer.component.html',
	styleUrls: ['./disclaimer.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class DisclaimerComponent {
	@Input() label: string = '';
	@Input() type: 'info' | 'warn' | 'error' | 'blocker' = 'info';
}
