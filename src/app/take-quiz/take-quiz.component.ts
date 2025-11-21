import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Answer } from '@app/shared/answer';
import { Logger } from '@app/shared/logger';
import { ProgressBarComponent } from '@app/shared/progress-bar/progress-bar.component';
import { Question } from '@app/shared/question';
import { Quiz } from '@app/shared/quiz';
import { QuizStatus } from '@app/shared/quiz-status';
import { QuizService } from '@app/shared/quiz.service';
import { shuffle } from '@app/shared/shuffle';
import { StickyBarComponent } from '@app/shared/sticky-bar/sticky-bar.component';
import { Stopwatch } from '@app/shared/stopwatch';
import { TimeSpentPipe } from '@app/shared/time-spent-pipe';

@Component({
  selector: 'app-take-quiz',
  templateUrl: './take-quiz.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    StickyBarComponent,
    TimeSpentPipe,
    ProgressBarComponent,
  ],
})
export class TakeQuizComponent implements OnDestroy {

  private readonly logger = new Logger('Take Quiz Component');

  private readonly quizService = inject(QuizService);

  /** Exposed enum for the template. */
  protected readonly QuizStatus = QuizStatus;

  /** Stopwatch instance used for tracking time spent, pause and resume. */
  protected readonly stopwatch = new Stopwatch((): void => {
    this.forceComplete();
  });

  /** Whether quiz is being taken currently*/
  public readonly isTakingQuiz = signal<boolean>(false);

  /** Used in template to show the right step to the user. */
  public readonly questionIndex = signal<number>(0);

  /** Current ID of the quiz that is being taken. */
  public readonly id = input.required<string>();

  /** Current quiz that is being taken. */
  public readonly quiz = linkedSignal((): Quiz | null => {
    const id: string = this.id();
    const quiz: Quiz | null = untracked(() => this.quizService.retrieve(id));
    if (!quiz || quiz.isDraft) {
      return null;
    }
    return quiz;
  });

  /** Total score that is earned by answering questions. */
  protected readonly score = computed((): number => {
    const quiz: Quiz | null = this.quiz();
    if (!quiz || !quiz.result) {
      return 0;
    }
    let total = 0;
    for (const question of quiz.questions) {
      if (question.correctOption === quiz.result.answers[question.id].answer) {
        total += question.points;
      }
    }
    return total;
  });

  /** Total score available for this quiz. */
  protected readonly totalScore = computed((): number => {
    const quiz: Quiz | null = this.quiz();
    if (!quiz || !quiz.result) {
      return 0;
    }
    let total = 0;
    for (const question of quiz.questions) {
      total += question.points;
    }
    return total;
  });

  /** Entire object of current question based on current question index. */
  public readonly question = computed<Question | null>(() => {
    const index: number = this.questionIndex();
    const quiz: Quiz | null = this.quiz();
    if (!quiz || !quiz.result) {
      return null;
    }
    return quiz.questions[index];
  });

  /** Number of questions that are answered. Used for tracking progress. */
  public readonly answeredCount = computed((): number => {
    const quiz: Quiz | null = this.quiz();
    if (!quiz || !quiz.result) {
      return 0;
    }
    const answers: Answer[] = Object.values(quiz.result.answers);
    return answers.filter((answer: Answer): boolean => answer.answered).length;
  });

  /**
   * Update the local and database level quiz object.
   *
   * We use this method instead of directly updating the quiz linked signal
   * because we want to make the code shorter and trigger
   * database update and local computed methods.
   *
   * @param quiz=null Use this data or existing computed value.
   */
  private quizUpdate(quiz: Quiz): void {
    this.quizService.update(quiz.id, quiz);
    this.quiz.set({ ...quiz });
  }

  /**
   * Force complete quiz.
   *
   * Being used when quiz gets abandoned or timer reaches limit.
   */
  private forceComplete(): void {
    // Clear out timer
    this.stopwatch.stop();
    const quiz: Quiz | null = this.quiz();
    if (!quiz || !quiz.result || !this.isTakingQuiz()) {
      return;
    }
    this.logger.log('Force completing question');
    quiz.result.timeSpent = this.stopwatch.totalTime();
    // Cap the time spent just in case
    if (quiz.result.timeSpent >= quiz.timeLimit * 100) {
      quiz.result.timeSpent = quiz.timeLimit * 1000;
    }
    // Set quiz as completed
    quiz.status = QuizStatus.Completed;
    // View results
    this.isTakingQuiz.set(false);
    // Finally, update and commit the quiz
    this.quizUpdate(quiz);
  }

  /** Triggered when user clicks on the next button. */
  protected nextQuestion(): void {
    this.questionIndex.set(this.questionIndex() + 1);
    this.logger.log(`Showing next question (#${this.questionIndex()})`);
  }

  /**
   * Triggered when user has selected an answer and clicks on confirm or when
   * clicks on skip for optional questions.
   *
   * @param skip=false whether skipping the question.
   */
  protected confirmAnswer(skip = false): void {
    const quiz: Quiz | null = this.quiz();
    const question: Question | null = this.question();
    // Type safety checks
    if (!quiz || !quiz.result || !question) {
      return;
    }
    // Store the answer object
    const answer = quiz.result.answers[question.id];
    // Mark answer as answered
    answer.answered = true;
    // Force answer to `null` if skipped
    if (skip) {
      answer.answer = null;
    }
    // Is currently in the last step (question)?
    if (this.questionIndex() + 1 === quiz.questions.length) {
      // Mark quiz as completed (all questions are answered).
      quiz.status = QuizStatus.Completed;
      // Update time spent
      this.stopwatch.stop();
      quiz.result.timeSpent = this.stopwatch.totalTime();
    }
    // Finally, update and commit the quiz
    this.quizUpdate(quiz);
    // Some cute logging
    this.logger.log(`Confirmed answer (skipped? ${skip})`);
  }

  /**
   * Take a break from taking the quiz.
   * Updates UI flag which results in displaying the overview.
   */
  protected pause(): void {
    const quiz: Quiz | null = this.quiz();
    if (!quiz?.result) {
      return;
    }
    // Update the flag
    this.isTakingQuiz.set(false);
    // Stop the timer
    this.stopwatch.stop();
    // Update result time spent
    quiz.result.timeSpent = this.stopwatch.totalTime();
    // Commit to database
    this.quizUpdate(quiz);
  }

  /** UI action for start or resume of the quiz. */
  public startOrResume(): void {
    // Grab the quiz
    const quiz: Quiz | null = this.quiz();
    // Make sure it is set (safety)
    if (!quiz || !quiz.result) {
      this.logger.error('Start or resume when quiz is not set.');
      return;
    }
    // Make sure it is not completed (safety)
    if (quiz.status === QuizStatus.Completed) {
      return;
    }
    // Is in progress? Resume
    if (quiz.status === QuizStatus.InProgress) {
      this.logger.log('Resumed quiz');
    }
    // Not in progress? Start
    else {
      this.logger.log('Started quiz');
      // Set status to in progress
      quiz.status = QuizStatus.InProgress;
      // Ensure time spent to 0
      quiz.result.timeSpent = 0;
      // Shuffle questions
      // Note: This can be written better so it does not modify the database.
      if (quiz.shuffleQuestions) {
        quiz.questions = shuffle(quiz.questions);
      }
      // Changes where made to quiz, update it
      this.quizUpdate(quiz);
    }
    // Set the current question index to the number of questions answered
    // For example, if there are 5 questions, and 2 answered, the index
    // would be 2.
    // This way, the UI will follow the logic and shows the right step.
    this.questionIndex.set(this.answeredCount());
    // Mark as taking quiz
    this.isTakingQuiz.set(true);
    // Reset timer to time spent on the quiz
    this.stopwatch.reset(quiz.result.timeSpent, quiz.timeLimit * 1000);
    this.stopwatch.start();
  }

  public ngOnDestroy(): void {
    this.forceComplete();
  }
}
