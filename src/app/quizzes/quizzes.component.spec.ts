import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Quiz } from '@app/shared/quiz';
import { QuizStatus } from '@app/shared/quiz-status';
import { QuizService } from '@app/shared/quiz.service';
import { QuizzesComponent } from './quizzes.component';

describe('QuizzesComponent', () => {

  let component: QuizzesComponent;
  let quizService: QuizService;

  const mockQuiz = (status: QuizStatus, isDraft = false): Omit<Quiz, 'id'> => ({
    title: 'Test Quiz',
    description: '',
    timeLimit: 60,
    shuffleQuestions: false,
    questions: [],
    result: null,
    status,
    isDraft,
  });

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [QuizzesComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
      ],
    }).compileComponents();

    quizService = TestBed.inject(QuizService);
    component = TestBed.createComponent(QuizzesComponent).componentInstance;
  });

  it('should filter quizzes', () => {
    expect(component.quizzes().length).toBe(0);

    quizService.create(mockQuiz(QuizStatus.NotTaken));
    quizService.create(mockQuiz(QuizStatus.NotTaken));
    quizService.create(mockQuiz(QuizStatus.NotTaken));
    quizService.create(mockQuiz(QuizStatus.InProgress));
    quizService.create(mockQuiz(QuizStatus.InProgress));
    quizService.create(mockQuiz(QuizStatus.Completed));
    expect(component.quizzes().length).toBe(6);

    component.status.set(QuizStatus.InProgress);
    expect(component.quizzes().length).toBe(2);

    component.status.set(QuizStatus.Completed);
    expect(component.quizzes().length).toBe(1);

    component.status.set(null);
    expect(component.quizzes().length).toBe(6);
  });
});
