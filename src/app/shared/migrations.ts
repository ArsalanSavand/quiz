/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Database } from '@app/shared/database';
import { Migration } from './migration';

export const MIGRATIONS: Migration[] = [
  // Add time spent to quizzes
  (database: Database): boolean => {
    if (database.version === 1) {
      for (const quiz of database.quizzes) {
        if (!quiz.result) {
          continue;
        }
        quiz.result.timeSpent = 0;
      }
      database.version = 2;
      return true;
    }
    return false;
  },
  // Add theme
  (database: Database): boolean => {
    if (database.version === 2) {
      database.theme = null;
      database.version = 3;
      return true;
    }
    return false;
  },
];

