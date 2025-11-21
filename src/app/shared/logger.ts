import { environment } from '@environments/environment';

/**
 * Prefixes console debug messages with a colored, name-tagged label for easier
 * identification during debugging.
 */
export class Logger {

  private readonly colors = {
    primary: '#56ffca',
    danger: '#ff5c5c',
    warning: '#ffce49',
  };

  constructor(public readonly name: string) {
  }

  private print(color: string, ...args: unknown[]): void {
    if (environment.name === 'testing') {
      return;
    }
    console.debug(`%c[${this.name}]`, `color: ${color}`, ...args);
  }

  public log(...args: unknown[]): void {
    this.print(this.colors.primary, ...args);
  }

  public warn(...args: unknown[]): void {
    this.print(this.colors.warning, ...args);
  }

  public error(...args: unknown[]): void {
    this.print(this.colors.danger, ...args);
  }
}
