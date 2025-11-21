import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ControlErrorComponent } from '@app/shared/control-error/control-error.component';
import { generateUniqueString } from '@app/shared/generate-unique-string';
import { OptionControls } from '@app/shared/option-controls';
import { QuestionControls } from '@app/shared/question-controls';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    ControlErrorComponent,
    DecimalPipe,
  ],
})
export class QuestionComponent {

  public readonly showErrors = input.required<boolean>();

  public readonly question = input.required<FormGroup<QuestionControls>>();

  public readonly options = input.required<FormArray<FormGroup<OptionControls>>>();

  public readonly isDraft = input.required<boolean>();

  public readonly index = input.required<number>();

  /** Method that validates the correct option. */
  private checkCorrectOption(): void {
    // Correct option control
    const correct: FormControl<string | null> = this.question().controls.correctOption;
    // If there are no options, correct option should be `null`
    if (!this.options().length) {
      correct.patchValue(null);
      return;
    }
    // Is current correct option a valid option ID?
    const isValidOption: boolean = this.options().controls.some(
      (option: FormGroup<OptionControls>): boolean => option.value.id === correct.value,
    );
    // Is correct option `null`? or is it referencing to an invalid option ID?
    // Then set it to the first option
    if (!correct.valid || !isValidOption) {
      correct.patchValue(this.options().at(0).controls.id.value);
    }
  }

  /** Add new option */
  protected addOption(): void {
    this.options().push(new FormGroup({
      id: new FormControl<string>(generateUniqueString(), {
        nonNullable: true,
      }),
      text: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }));
    this.checkCorrectOption();
  }

  /**
   * On option sorted.
   *
   * @param event CDK drag data.
   */
  protected onOptionDrop(event: CdkDragDrop<void>) {
    const control: FormGroup<OptionControls> = this.options().at(event.previousIndex);
    this.options().removeAt(event.previousIndex);
    this.options().insert(event.currentIndex, control);
  }

  protected removeOption(index: number): void {
    this.options().removeAt(index);
    this.checkCorrectOption();
  }
}
