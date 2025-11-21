import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Quiz } from '@app/shared/quiz';
import { QuizStatus } from '@app/shared/quiz-status';
import { QuizService } from '@app/shared/quiz.service';
import { TakeQuizComponent } from './take-quiz.component';

describe('TakeQuizComponent', () => {

  let fixture: ComponentFixture<TakeQuizComponent>;
  let component: TakeQuizComponent;
  let quizService: QuizService;

  let mockQuizData: Omit<Quiz, 'id'> = {
    title: 'Test Quiz',
    description: '',
    timeLimit: 60,
    shuffleQuestions: false,
    questions: [
      {
        id: 'question-1',
        prompt: 'First question?',
        points: 5,
        required: true,
        options: [
          {
            id: 'question-1-option-1',
            text: 'Option 1',
          },
          {
            id: 'question-1-option-2',
            text: 'Option 2',
          },
        ],
        correctOption: 'question-1-option-1',
      },
      {
        id: 'question-2',
        prompt: 'Second question?',
        points: 5,
        required: false,
        options: [
          {
            id: 'question-2-option-1',
            text: 'Option 1',
          },
          {
            id: 'question-2-option-2',
            text: 'Option 2',
          },
          {
            id: 'question-2-option-3',
            text: 'Option 3',
          },
        ],
        correctOption: 'question-2-option-1',
      },
    ],
    result: {
      answers: {
        'question-1': {
          answer: null,
          answered: false,
        },
      },
      timeSpent: 0,
    },
    status: QuizStatus.NotTaken,
    isDraft: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TakeQuizComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
      ],
    }).compileComponents();

    quizService = TestBed.inject(QuizService);
    const mockQuiz: Quiz = quizService.create(mockQuizData);

    fixture = TestBed.createComponent(TakeQuizComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', mockQuiz.id);
  });

  it('should test some methods', () => {
    expect(component.quiz()!.id).toBeTruthy();
    expect(component.quiz()!.status).toEqual(QuizStatus.NotTaken);
    expect(component.quiz()!.result!.timeSpent).toBe(0);
    expect(component.answeredCount()).toBe(0);
    expect(component.isTakingQuiz()).toBeFalse();

    component.startOrResume();

    expect(component.quiz()!.status).toEqual(QuizStatus.InProgress);
    expect(component.isTakingQuiz()).toBeTrue();
    expect(component.questionIndex()).toBe(component.answeredCount());
  });
});
