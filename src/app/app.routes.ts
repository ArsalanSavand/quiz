import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'quizzes',
    loadComponent: () => import('./quizzes/quizzes.component').then(m => m.QuizzesComponent),
    title: 'Quizzes',
  },
  {
    path: 'quiz/:id',
    loadComponent: () => import('./quiz/quiz.component').then(m => m.QuizComponent),
    title: 'Quiz',
  },
  {
    path: 'take-quiz/:id',
    loadComponent: () => import('./take-quiz/take-quiz.component').then(m => m.TakeQuizComponent),
    title: 'Take Quiz',
  },
  {
    path: '**',
    redirectTo: 'quizzes',
  },
];
