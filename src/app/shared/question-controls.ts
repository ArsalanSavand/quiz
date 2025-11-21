import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { OptionControls } from './option-controls';

export interface QuestionControls {
  id: FormControl<string>,
  prompt: FormControl<string>;
  points: FormControl<number>;
  required: FormControl<boolean>;
  options: FormArray<FormGroup<OptionControls>>;
  correctOption: FormControl<string | null>;
}
