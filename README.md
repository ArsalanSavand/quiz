# Quiz (Assignment)

Build quizzes, take them, and see your results.

## Architecture

Using a service-based architecture with signal-driven reactivity.

### `DatabaseService`

`DatabaseService` is the single source of truth, persisting data to
`localStorage`.

### `QuizService`

`QuizService` provides CRUD operations for components to use as if the app is
using a back-end server (RESTful) with API calls.

Components don't interact with the database, instead they use this service
which communicates with the database itself, similar to `ThemeService`.

### Reactive Forms

Taking advantage of Angular's Reactive Forms with strict types and `FormArray`.

For some projects, this could be overkill but this project is a great
opportunity for demonstrating the capabilities of the Reactive Forms.

### OnPush & Signals

`OnPush` strategy mixed with signals with all state updates being immutable
provides great performance and change detection efficiency for the project.

## Trade-offs

Using `localStorage` due to simplicity and time. Ideally, I'd go for `IndexedDB`
for storage for an SPA without a back-end server because I would not have to
worry about the limitations of `localStorage` such as 5MB limit and
device-specific behaviour limitation.

## Features

- Signals
- Strictly Typed Reactive Form
- Form validation
- Local Storage
- OnPush Strategy
- Angular CDK
- GitHub Actions
- ESLint
- Responsive design
- Custom pipes
- _Many more_

## Development

Built with `angular@20`.

### Build

App will be built into `./dist/quiz/browser`.

```
npm run build
```

### Serve

App will be served at `http://localhost:4200/`.

```
npm run start
```

### Code Quality (ESLint)

```
npm run lint
```

### Unit-tests

```
npm run test
npm run test:headless
npm run test:ci
```
