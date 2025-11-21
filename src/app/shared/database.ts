import { Quiz } from './quiz';
import { Theme } from './theme';

export interface Database {
  version: number;
  quizzes: Quiz[];
  theme: Theme | null;
}
