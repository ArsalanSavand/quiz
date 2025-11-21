import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, untracked } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuestionComponent } from '@app/quiz/question/question.component';
import { ControlErrorComponent } from '@app/shared/control-error/control-error.component';
import { generateUniqueString } from '@app/shared/generate-unique-string';
import { Option } from '@app/shared/option';
import { OptionControls } from '@app/shared/option-controls';
import { Question } from '@app/shared/question';
import { QuestionControls } from '@app/shared/question-controls';
import { Quiz } from '@app/shared/quiz';
import { QuizControls } from '@app/shared/quiz-controls';
import { QuizStatus } from '@app/shared/quiz-status';
import { QuizService } from '@app/shared/quiz.service';
import { StickyBarComponent } from '@app/shared/sticky-bar/sticky-bar.component';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    QuestionComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    ControlErrorComponent,
    FormsModule,
    DecimalPipe,
    RouterLink,
    StickyBarComponent,
  ],
})
export class QuizComponent {

  private readonly router = inject(Router);
  private readonly quizService = inject(QuizService);

  /** Current quiz ID or `"new"` in case of creation. */
  protected id = input.required<string>();

  /** Whether we are in create mode. */
  protected readonly isCreate = computed((): boolean => this.id() === 'new');

  /** Whether to show input errors for UI. */
  protected readonly showErrors = signal<boolean>(false);

  /** Quiz form group. */
  protected readonly form = new FormGroup<QuizControls>({
    title: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
      ],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
    }),
    timeLimit: new FormControl<number>(60, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(60),
      ],
    }),
    shuffleQuestions: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
    questions: new FormArray<FormGroup<QuestionControls>>([], {
      validators: [Validators.required],
    }),
  });

  /** Current quiz object or `null` in case of creation. */
  protected readonly quiz = computed((): Quiz | null => {
    const id: string = this.id();
    if (id === 'new') {
      return null;
    }
    // It uses a signal so we are going to untrack it.
    const quiz: Quiz | null = untracked((): Quiz | null => this.quizService.retrieve(id));
    if (!quiz) {
      return null;
    }
    this.form.patchValue(quiz);
    this.form.controls.questions.clear();
    for (const question of quiz.questions) {
      this.addQuestion(question);
    }
    if (!quiz.isDraft) {
      this.form.disable();
    }
    return quiz;
  });

  /** Whether this quiz is draft. */
  protected readonly isDraft = computed((): boolean => {
    const quiz = this.quiz();
    if (!quiz) {
      return true;
    }
    return quiz.isDraft;
  });

  /** @returns quiz data from form group. */
  private get formValue(): Omit<Quiz, 'id' | 'isDraft' | 'status' | 'result'> {
    return this.form.getRawValue();
  }

  /** Update or create this quiz. */
  private save(isDraft: boolean): void {
    let result: Quiz['result'] = null;
    if (!isDraft) {
      result = {
        answers: {},
        timeSpent: 0,
      };
      for (const question of this.formValue.questions) {
        result.answers[question.id] = {
          answer: null,
          answered: false,
        };
      }
    }
    const data: Omit<Quiz, 'id'> = {
      ...this.formValue,
      status: QuizStatus.NotTaken,
      isDraft,
      result,
    };
    if (this.isCreate()) {
      const quiz: Quiz = this.quizService.create(data);
      if (isDraft) {
        this.router.navigate(['quiz', quiz.id], { replaceUrl: true });
      }
    } else {
      this.quizService.update(this.id(), data);
    }
    if (!isDraft) {
      this.router.navigateByUrl('/');
    }
  }

  /** Add a new question to the quiz. */
  protected addQuestion(question?: Question): void {
    let options: FormGroup<OptionControls>[] = [];
    if (question) {
      options = question.options.map((option: Option): FormGroup<OptionControls> => new FormGroup<OptionControls>({
        id: new FormControl<string>(option.id, {
          nonNullable: true,
        }),
        text: new FormControl<string>(option.text, {
          nonNullable: true,
          validators: [Validators.required],
        }),
      }));
    }
    const form = new FormGroup({
      id: new FormControl<string>(generateUniqueString(), {
        nonNullable: true,
      }),
      prompt: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      points: new FormControl<number>(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      required: new FormControl<boolean>(true, {
        nonNullable: true,
      }),
      options: new FormArray<FormGroup<OptionControls>>(options, {
        validators: [Validators.required],
      }),
      correctOption: new FormControl<string | null>(null, {
        validators: [Validators.required],
      }),
    });
    if (question) {
      form.patchValue(question);
    }
    this.form.controls.questions.push(form);
  }

  /**
   * On question sorted.
   *
   * @param event CDK drag data.
   */
  protected onQuestionDrop(event: CdkDragDrop<void>) {
    const control = this.form.controls.questions.at(event.previousIndex);
    this.form.controls.questions.removeAt(event.previousIndex);
    this.form.controls.questions.insert(event.currentIndex, control);
  }

  /** Delete the quiz. */
  protected destroy(): void {
    if (this.isCreate()) {
      return;
    }
    this.quizService.destroy(this.id());
    this.router.navigate(['/quizzes']);
  }

  /** Attempt to publish the quiz. */
  protected publish(): void {
    this.showErrors.set(true);
    if (this.form.invalid) {
      return;
    }
    for (const question of this.form.controls.questions.controls) {
      if (question.invalid) {
        return;
      }
    }
    this.save(false);
  }

  /** Save this quiz as draft. */
  protected draft(): void {
    this.showErrors.set(false);
    this.save(true);
  }
}
