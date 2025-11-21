import { Option } from './option';

export interface Answer {
  answer: Option['id'] | null;
  answered: boolean;
}
