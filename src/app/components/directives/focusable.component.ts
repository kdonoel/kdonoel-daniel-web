import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

// todo: refactor this using an OpaqueToken
@Component({
	template: '',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: false,
})
export class FocusableComponent {
	@Output('focusChange') focusChange: EventEmitter<any> = new EventEmitter<any>();
}
