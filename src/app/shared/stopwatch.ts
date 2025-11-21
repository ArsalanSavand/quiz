import { signal } from '@angular/core';

/** Isolated class to handle quiz time spent logic. */
export class Stopwatch {

  /** Rate of calculation (per millisecond). */
  private readonly calculationRate = 60;

  /** Reference to {@link window.setInterval}. */
  private interval?: ReturnType<typeof setInterval>;

  /** Internally stored to calculate delta time of start and stop. */
  private startTime = 0;

  private timeLimit = 0;

  /** Total time passed. */
  public readonly totalTime = signal(0);

  constructor(private readonly onLimitReach: () => void) {
  }

  /** Reset timer with given total time. */
  public reset(totalTime: number, timeLimit: number): void {
    clearInterval(this.interval);
    this.timeLimit = timeLimit;
    this.totalTime.set(totalTime);
  }

  /** Start the timer. */
  public start(): void {
    this.startTime = performance.now();
    this.interval = setInterval((): void => {
      this.calculate();
      // Stop the timer once limit reached.
      if (this.totalTime() >= this.timeLimit) {
        this.onLimitReach();
        this.stop();
      }
    }, this.calculationRate);
  }

  /** Stop the timer and calculate. */
  public stop(): void {
    clearInterval(this.interval);
    this.calculate();
  }

  /** Calculate (update) total time. */
  public calculate(): void {
    this.totalTime.update((value: number): number => value + (performance.now() - this.startTime));
    this.startTime = performance.now();
  }
}
