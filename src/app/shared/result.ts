import { Answer } from './answer';
import { Question } from './question';

export interface Result {
  answers: Record<Question['id'], Answer>;
  timeSpent: number;
}
