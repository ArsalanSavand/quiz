import { effect, Injectable, signal } from '@angular/core';
import { Database } from './database';
import { Logger } from './logger';
import { Migration } from './migration';
import { MIGRATIONS } from './migrations';

/**
 * Controls the persistence of application data in `localStorage`.
 *
 * Gives the application database a reactive signal-based interface.
 *
 * Every time the data signal is updated, changes are automatically saved to
 * `localStorage`.
 *
 * Manages error recovery, loading, and initialization for persistent storage.
 */
@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  /** Logger instance used for debugging. */
  private readonly logger = new Logger('Database Service');

  /**
   * Whether database is initialized.
   * Used to ignore saving on initial data signal value.
   */
  private initiated = false;

  /** Key for the database in `localStorage`. */
  public readonly key = 'database';

  /** Current data of the database. */
  public readonly data = signal<Database>(this.load());

  /** Default value for database initialization. */
  public get defaultValue(): Database {
    return {
      version: 3,
      quizzes: [],
      theme: null,
    };
  }

  constructor() {
    // Save data to database whenever it changes.
    // Ignore initial trigger.
    effect((): void => {
      const data: Database = this.data();
      if (!this.initiated) {
        this.initiated = true;
        return;
      }
      this.save(data);
    });
  }

  /**
   * Save given data to the database.
   *
   * @param data new data to save.
   */
  private save(data: Database): void {
    this.logger.log('Saving');
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  /**
   * Run migration for the given data.
   * @param data to migrate.
   * @returns migrated data.
   */
  private migrate(data: Database): Database {
    let save = false;
    MIGRATIONS.forEach((migration: Migration, index: number): void => {
      const result: boolean = migration(data);
      if (result) {
        this.logger.log(`Ran migration #${index}`);
        save = true;
      }
    });
    if (save) {
      this.save(data);
    }
    return data;
  }

  /**
   * Load data from database.
   *
   * @returns the default value or data from database.
   */
  private load(): Database {
    try {
      const data: string | null = localStorage.getItem(this.key);
      if (data) {
        this.logger.log('Loading');
        return this.migrate(JSON.parse(data) as Database);
      }
    } catch (error: unknown) {
      this.logger.warn('Failed to load database', error);
      localStorage.removeItem(this.key);
    }
    this.logger.log('Initializing with default value');
    return this.defaultValue;
  }
}
