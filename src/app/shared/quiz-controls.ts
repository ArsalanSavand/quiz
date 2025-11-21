import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { QuestionControls } from './question-controls';

export interface QuizControls {
  title: FormControl<string>;
  description: FormControl<string>;
  timeLimit: FormControl<number>;
  shuffleQuestions: FormControl<boolean>;
  questions: FormArray<FormGroup<QuestionControls>>;
}
