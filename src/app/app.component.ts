import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Logger } from '@app/shared/logger';
import { Theme } from '@app/shared/theme';
import { ThemeService } from '@app/shared/theme.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    NgOptimizedImage,
  ],
})
export class AppComponent {

  private readonly logger = new Logger('App');

  protected readonly themeService = inject(ThemeService);

  /** Exposed for the view. */
  protected readonly Theme = Theme;

  constructor() {
    this.logger.log(`Quiz (${environment.name})`);
  }
}
