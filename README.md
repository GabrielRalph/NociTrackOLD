# nocitrack-pain-management-demo

A static Nocitrack demo app for running pain-management questionnaires through
Squidly accessibility controls.

## How the app starts

`index.html` loads two files:

- `style.css` for the plain CSS layout and button styling.
- `app.js` as a browser module for all app logic.

When `app.js` runs, it creates one `PainManagementApp` instance. That instance:

1. Creates the root app container.
2. Registers Squidly/Firebase listeners inside `init()`.
3. Loads the assessment index from `question-banks/index.json`.
4. Renders the current screen.

The remote `state` value defaults to `menu` inside the listener: if no value
exists on a fresh session the app writes `menu` and continues.

## App states

The app has three screen states:

- `menu`: shows the list of available assessments.
- `assessment`: shows the current question and answer options.
- `result`: shows the completed answers list with a download button.

## Screen rendering

Screens are defined as custom element classes in `ui/views.js`:

| State | View class |
|---|---|
| `menu` | `MenuView` |
| `assessment` | `QuestionView` |
| `result` | `ResultsView` |
| fallback | `MessageView` |

`currentScreen` is a getter that picks the right class from a `STATE_VIEWS` map
and constructs it with a single `viewData` object containing the current
assessment data and all event callbacks.

## Screen flow

### Menu

`MenuView` renders the assessment selection screen. When an assessment button is
activated, `onSelectAssessment` is called, which:

1. Clears local `assessment` and `answersPayload`.
2. Writes the new `assessmentId` and clears `assessmentAnswers` in Firebase.
3. Sets the remote `state` to `assessment`.

### Assessment

`QuestionView` renders navigation, progress, question text, an optional image,
and the answer buttons.

When an answer is activated, `onAnswer` saves it to the local `Assessment` model,
serialises the full payload, and writes it to `assessmentAnswers`.

When Previous or Next is pressed, `onMoveQuestion` advances the index, re-serialises
the payload (which embeds `questionIndex`), and writes it to `assessmentAnswers`.

The Home button resets all local and remote state back to menu.

### Result

On the last question the Result button appears. Activating it sets `state` to
`result`. `ResultsView` shows each question with its recorded answer and provides
a CSV download.

## Data model

`models/models.js` defines three classes:

- `Assessment`: owns the question list, current question index, and answers map.
- `Question`: one question from a question bank.
- `Answer`: one recorded answer.

`Assessment.toAnswerPayload()` produces the payload written to Firebase:

```json
{
  "assessmentId": "fear-of-pain",
  "assessmentVersion": "1.0",
  "questionIndex": 2,
  "updatedAt": "2026-05-10T00:00:00.000Z",
  "answers": [
    {
      "questionId": "fop-1",
      "value": 2,
      "answeredAt": "2026-05-10T00:00:00.000Z"
    }
  ]
}
```

`questionIndex` is stored inside the payload, not as a separate Firebase key.

## Question banks

```text
question-banks/index.json
question-banks/fear-of-pain.json
question-banks/pain-inference.json
```

`AssessmentRepository` loads and caches both the index and individual
assessments. The source is `default_bank`, which reads local JSON files.

## Squidly state integration

The app reads and writes these Firebase keys via `SquidlyAPI`:

- `state` — current app state (`menu`, `assessment`, or `result`)
- `assessmentId` — ID of the selected assessment
- `assessmentAnswers` — full answer payload JSON (includes `questionIndex`)

The app expects `SquidlyAPI` to be available before `app.js` runs.

## State synchronisation

`assessment` and `answersPayload` are smart setters on `PainManagementApp`.
When either is set they cross-apply to each other: loading an assessment
restores saved answers and question index from the payload, and receiving a new
payload applies it to the loaded assessment immediately.

## Rendering strategy

`requestRender()` schedules a render with `setTimeout(..., 0)` so that multiple
rapid state changes collapse into one DOM update and no replacement happens
inside a Squidly `access-click` handler.

Every render is a full screen replacement — `root.replaceChildren(this.currentScreen)`.
There is no partial DOM patching.

## Styling

Plain CSS only. No Tailwind, build step, or package manager.

- Full-viewport grid layouts for assessment and result screens.
- Navigation in the left column; question and answer content in the main area.
- Viewport-based image sizing to avoid layout jumps on question changes.

## Project structure

```text
app.js                         App coordinator and state transitions
index.html                     Static HTML entry point
style.css                      Plain CSS styles
models/models.js               Assessment, Question, and Answer model classes
services/AssessmentRepository.js
                               Loads and caches question-bank data
ui/views.js                    View classes for each app screen
ui/squidly-utils.js            Squidly component library
question-banks/                Assessment JSON files
images/                        Question and answer images
```
