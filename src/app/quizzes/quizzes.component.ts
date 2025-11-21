import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Quiz } from '@app/shared/quiz';
import { QuizStatus } from '@app/shared/quiz-status';
import { QuizService } from '@app/shared/quiz.service';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
  ],
})
export class QuizzesComponent {

  private readonly quizService = inject(QuizService);

  /** Exposed for the template. */
  protected readonly QuizStatus = QuizStatus;

  /** Status used to display in template and be selected. */
  protected readonly statuses: QuizStatus[] = Object.values(QuizStatus);

  /** Selected status for filtering quizzes. */
  public readonly status = signal<QuizStatus | null>(null);

  /** List of quizzes filtered for the template. */
  public readonly quizzes = computed((): Quiz[] => {
    const list: Quiz[] = this.quizService.list();
    const status: QuizStatus | null = this.status();
    if (status === null) {
      return list;
    }
    return list.filter((quiz: Quiz): boolean => quiz.status === status);
  });
}
