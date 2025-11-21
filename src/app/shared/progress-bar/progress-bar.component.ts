import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class ProgressBarComponent {

  public readonly total = input.required<number>();

  public readonly current = input.required<number>();
}
