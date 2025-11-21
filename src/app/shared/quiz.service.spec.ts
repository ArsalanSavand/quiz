import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';
import { Quiz } from './quiz';
import { QuizStatus } from './quiz-status';
import { QuizService } from './quiz.service';

describe('QuizService', () => {

  let quizService: QuizService;
  let databaseService: DatabaseService;

  const mockQuizData: Omit<Quiz, 'id'> = {
    title: 'Test Quiz',
    description: 'Test Description',
    timeLimit: 60,
    shuffleQuestions: false,
    questions: [],
    status: QuizStatus.NotTaken,
    isDraft: true,
    result: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    databaseService = TestBed.inject(DatabaseService);
    quizService = TestBed.inject(QuizService);
  });

  it('should create quiz and add to list', () => {
    const quiz = quizService.create(mockQuizData);
    expect(quiz.id).toBeDefined();
    expect(quizService.list().length).toBe(1);
    expect(databaseService.data().quizzes).toContain(quiz);
  });

  it('should retrieve quiz by id or return null', () => {
    const quiz = quizService.create(mockQuizData);
    expect(quizService.retrieve(quiz.id)).toEqual(quiz);
    expect(quizService.retrieve('non-existent')).toBeNull();
  });

  it('should update quiz and return true or false', () => {
    const quiz = quizService.create(mockQuizData);
    expect(quizService.update(quiz.id, { ...mockQuizData, title: 'Updated' })).toBe(true);
    expect(quizService.retrieve(quiz.id)?.title).toBe('Updated');
    expect(quizService.update('non-existent', mockQuizData)).toBe(false);
  });

  it('should destroy quiz from list', () => {
    const quiz = quizService.create(mockQuizData);
    quizService.destroy(quiz.id);
    expect(quizService.list().length).toBe(0);
    expect(quizService.retrieve(quiz.id)).toBeNull();
  });
});
