import { Option } from './option';

export interface Question {
  id: string;
  prompt: string;
  points: number;
  required: boolean;
  options: Option[];
  correctOption: Option['id'] | null;
}
