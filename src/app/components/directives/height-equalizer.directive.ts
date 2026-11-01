import {
	AfterViewChecked,
	AfterViewInit,
	Directive,
	ElementRef,
	HostListener,
	Input,
} from '@angular/core';

import { WindowRefService } from '../window/window-ref.service';

/**
 * Ensures that a set of HTML element have the same height.
 * How to use: add the n9HeightEqualizer to a parent HTML element. The value of this attribute is a class name.
 * All children with this class name will have the same height (the height of the tallest element).
 * This directive handle resize. It does not handle dynamic height changes (for now).
 * example:
 * <ul n9HeightEqualizer="my-list-item">
 *     <li class="my-list-item">one</li>
 *     <li class="my-list-item">two</li>
 *     <li class="my-list-item">three</li>
 *     <!--all these items will have the same height -->
 * </ul>
 */
@Directive({
	selector: '[n9HeightEqualizer]',
	standalone: false,
})
export class HeightEqualizerDirective implements AfterViewChecked, AfterViewInit {
	@Input('n9HeightEqualizer') n9HeightEqualizer: string;
	className: string;

	constructor(
		private el: ElementRef,
		private windowRef: WindowRefService,
	) {}

	@HostListener('window:resize')
	onResize(): void {
		this.ensureEqualHeight();
	}

	ngAfterViewInit(): void {
		this.className = this.n9HeightEqualizer;
	}

	ngAfterViewChecked(): void {
		this.ensureEqualHeight();
	}

	getHeight(element: any): number {
		let h;
		let initialStyle;
		const window = this.windowRef.nativeWindow;

		if (element.currentStyle) {
			// IE
			initialStyle = window.getComputedStyle(element);
			h =
				parseFloat(initialStyle.getPropertyValue('height')) +
				parseFloat(initialStyle.getPropertyValue('padding-top')) +
				parseFloat(initialStyle.getPropertyValue('padding-bottom'));
		} else {
			initialStyle = window.getComputedStyle(element);
			h = parseFloat(initialStyle.getPropertyValue('height'));
		}
		return h;
	}

	ensureEqualHeight(): void {
		const children: any[] = Array.from(
			this.el.nativeElement.getElementsByClassName(this.className),
		);
		if (!children.length) return;
		children.forEach((child) => (child.style.height = 'auto'));
		const tallest = children.reduce((prev, curr) => {
			if (!prev) return curr;
			if (this.getHeight(curr) > this.getHeight(prev)) return curr;
			return prev;
		}, null);
		const maxHeight = this.getHeight(tallest);
		children.forEach((child) => (child.style.height = `${maxHeight}px`));
	}
}
