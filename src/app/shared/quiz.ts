import { Result } from '@app/shared/result';
import { Question } from './question';
import { QuizStatus } from './quiz-status';

export interface Quiz {
  id: string;
  title: string;
  description: string,
  timeLimit: number;
  shuffleQuestions: boolean;
  questions: Question[];
  status: QuizStatus;
  isDraft: boolean;
  result: Result | null;
}
