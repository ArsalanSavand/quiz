import { computed, inject, Injectable } from '@angular/core';
import { Database } from './database';
import { DatabaseService } from './database.service';
import { generateUniqueString } from './generate-unique-string';
import { Logger } from './logger';
import { Quiz } from './quiz';

/**
 * Manages CRUD operations for quizzes in the application. Provides methods to
 * create, retrieve, update, and delete quizzes while handling persistence
 * through the {@link DatabaseService}.
 *
 * Exposes a computed signal for reactive access to the quiz list.
 */
@Injectable({
  providedIn: 'root',
})
export class QuizService {

  private readonly logger = new Logger('Quiz Service');

  private readonly databaseService = inject(DatabaseService);

  /** Quizzes tied to the database. */
  public readonly list = computed((): Quiz[] => this.databaseService.data().quizzes);

  /** Save the given list of quizzes and update database. */
  private save(quizzes: Quiz[]): void {
    this.databaseService.data.update((database: Database): Database => ({
      ...database,
      quizzes: [...quizzes],
    }));
  }

  /**
   * Create a new quiz and save to database.
   * @param data of the new quiz.
   * @returns newly created quiz data.
   */
  public create(data: Omit<Quiz, 'id'>): Quiz {
    const quiz: Quiz = { ...data, id: generateUniqueString() };
    this.logger.log(`Creating quiz (${quiz.id})`);
    this.save([...this.list(), quiz]);
    return quiz;
  }

  /**
   * Get a quiz by ID.
   * @param id of the quiz.
   * @returns quiz or `null` if not found.
   */
  public retrieve(id: string): Quiz | null {
    const quiz: Quiz | undefined = this.list().find((item: Quiz): boolean => item.id === id);
    if (!quiz) {
      return null;
    }
    this.logger.log(`Retried quiz ${id}`);
    return quiz;
  }

  /**
   * Update the quiz with new data and save to database.
   * @returns whether operation was successful.
   */
  public update(id: string, data: Omit<Quiz, 'id'>): boolean {
    const quizzes: Quiz[] = this.list();
    const index: number = quizzes.findIndex((item: Quiz): boolean => item.id === id);
    if (index === -1) {
      return false;
    }
    quizzes[index] = { id, ...data };
    this.logger.log(`Updating quiz ${id}`);
    this.save(quizzes);
    return true;
  }

  /**
   * Remove quiz from database.
   * @param id quiz ID.
   */
  public destroy(id: string): void {
    let quizzes: Quiz[] = this.list().filter((item: Quiz): boolean => item.id !== id);
    this.logger.log(`Removing quiz ${id}`);
    this.save(quizzes);
  }
}
