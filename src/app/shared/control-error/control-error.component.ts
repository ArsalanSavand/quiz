import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-control-error',
  standalone: true,
  templateUrl: 'control-error.component.html',
  imports: [],
})
export class ControlErrorComponent {

  public readonly show = input<boolean>(true);

  public readonly control = input.required<AbstractControl<unknown>>();
}
