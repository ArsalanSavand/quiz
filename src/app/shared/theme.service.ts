import { MediaMatcher } from '@angular/cdk/layout';
import { computed, DOCUMENT, inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Database } from '@app/shared/database';
import { Logger } from '@app/shared/logger';
import { DatabaseService } from './database.service';
import { Theme } from './theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  private readonly logger = new Logger('Theme Service');

  private readonly document = inject<Document>(DOCUMENT);
  private readonly mediaMatcher = inject(MediaMatcher);
  private readonly databaseService = inject(DatabaseService);

  /** Current theme of the app. */
  public readonly theme = computed((): Theme => this.databaseService.data().theme || this.getDeviceTheme());

  /** Is theme synced with device? */
  public readonly isSyncedWithDevice = computed((): boolean => !this.databaseService.data().theme);

  /** @returns The `<html>` HTML element of the document. */
  protected get html(): HTMLHtmlElement {
    return this.document.documentElement as HTMLHtmlElement;
  }

  /**
   * Sets the theme in the `[data-bs-theme]` attribute of the `<html>`
   * element.
   */
  public set dataBsTheme(value: Theme) {
    this.html.setAttribute('data-bs-theme', value);
  }

  constructor() {
    this.logger.log(`Using ${this.theme()} theme`);
    toObservable(this.theme).subscribe((theme: Theme): void => {
      this.dataBsTheme = theme;
    });
  }

  public cycle(): void {
    let theme: Theme | null;
    switch (this.databaseService.data().theme) {
      case null:
        theme = Theme.Dark;
        break;
      case Theme.Dark:
        theme = Theme.Light;
        break;
      case Theme.Light:
        this.logger.log('Switched to sync theme with device');
        theme = null;
        break;
    }
    if (theme) {
      this.logger.log(`Switched to ${theme} theme`);
    }
    this.databaseService.data.update((data: Database): Database => ({ ...data, theme }));
  }

  public getDeviceTheme(): Theme {
    if (this.mediaMatcher.matchMedia('(prefers-color-scheme: dark)').matches) {
      return Theme.Dark;
    }
    return Theme.Light;
  }
}
