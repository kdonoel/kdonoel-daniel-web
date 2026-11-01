import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'al-footer',
	templateUrl: 'footer.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class FooterComponent {}
