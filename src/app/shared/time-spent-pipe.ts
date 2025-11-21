import { Pipe, PipeTransform } from '@angular/core';

/**
 * @example
 * <div>
 *   {{ 5 | timeSpent }} <!-- 00:05 -->
 *   {{ 65 | timeSpent }} <!-- 01:05 -->
 *   {{ 1552 | timeSpent }} <!-- 25:52 -->
 *   {{ 5012 | timeSpent }} <!-- 01:23:32 -->
 * </div>
 */
@Pipe({
  name: 'timeSpent',
})
export class TimeSpentPipe implements PipeTransform {

  public transform(seconds: number): string {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const secs: number = Math.floor(seconds % 60);

    const mm = minutes.toString().padStart(2, '0');
    const ss = secs.toString().padStart(2, '0');

    if (hours > 0) {
      const hh = hours.toString().padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    }

    return `${mm}:${ss}`;
  }
}
