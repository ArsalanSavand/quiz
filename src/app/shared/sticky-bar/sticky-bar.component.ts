import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sticky-bar',
  templateUrl: './sticky-bar.component.html',
  styleUrl: './sticky-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class StickyBarComponent {
}
