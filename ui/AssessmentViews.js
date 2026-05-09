import { createAccessButton } from "./accessButton.js";
import {
  ANSWER_IMAGE_SIZE,
  NAV_BUTTON_SIZE,
  QUESTION_IMAGE_SIZE,
  RESULT_BUTTON_SIZE,
  getAnswerButtonClass,
} from "./uiClasses.js";

const ANSWER_IMAGES = {
  0: { src: "images/happy.png", alt: "Happy" },
  1: { src: "images/smile.png", alt: "Smile" },
  2: { src: "images/neutral.png", alt: "Neutral" },
  3: { src: "images/sad.png", alt: "Sad" },
  4: { src: "images/crying.png", alt: "Crying" },
};

export class AssessmentViews {
  renderMenu({ assessmentIndex, onSelectAssessment }) {
    const container = document.createElement("main");
    container.className = "w-full max-w-6xl";

    const title = document.createElement("h1");
    title.className =
      "mb-[clamp(3vh,4vh,6vh)] text-center text-3xl font-bold leading-tight";
    title.textContent = "Choose an assessment";
    container.appendChild(title);

    const list = document.createElement("div");
    list.className =
      "mx-auto grid w-fit grid-cols-2 justify-items-center gap-[clamp(3vw,4vw,6vw)]";

    assessmentIndex.forEach((assessmentMeta) => {
      const button = document.createElement("button");
      button.className =
        "mx-auto aspect-square w-[clamp(180px,24vw,320px)] cursor-pointer rounded-lg border-2 border-[#b9ddec] bg-white/85 p-[clamp(1.5vw,2vw,3vw)] text-center text-[clamp(1.25rem,2.2vw,2.25rem)] font-bold leading-tight text-[#30306f] shadow hover:border-[#0795a1] hover:bg-[#e4f6f4]";
      button.textContent = assessmentMeta.title;

      const accessButton = createAccessButton(button, () => {
        onSelectAssessment(assessmentMeta.id);
      });

      list.appendChild(accessButton);
    });

    container.appendChild(list);
    return container;
  }

  renderAssessment({ assessment, onAnswer, onMoveQuestion, onShowResult }) {
    const question = assessment.currentQuestion();

    if (!question) {
      return this.renderMessage("No question found.");
    }

    const container = document.createElement("main");
    container.className = "w-full max-w-6xl";

    container.appendChild(
      this.createAssessmentNavigation({
        assessment,
        onMoveQuestion,
        onShowResult,
      }),
    );

    const progress = document.createElement("p");
    progress.className = "mb-2 text-center font-bold text-[#30306f]/80";
    progress.textContent = `${assessment.questionIndex + 1} / ${
      assessment.questions.length
    }`;
    container.appendChild(progress);

    const title = document.createElement("h1");
    title.className = "mb-4 text-center text-3xl font-bold leading-tight";
    title.textContent = assessment.title;
    container.appendChild(title);

    const questionLayout = document.createElement("div");
    questionLayout.className =
      "mb-4 grid items-center gap-[clamp(2vw,3vw,4vw)] md:grid-cols-[minmax(0,1fr)_clamp(12vh,10vw,18vh)]";

    const questionText = document.createElement("p");
    questionText.className = "m-0 text-2xl leading-snug";
    questionText.textContent = question.question;
    questionLayout.appendChild(questionText);

    if (question.imageUrl) {
      const image = document.createElement("img");
      image.className = `m-0 block ${QUESTION_IMAGE_SIZE} max-w-full object-contain`;
      image.src = question.imageUrl;
      image.alt = "";
      questionLayout.appendChild(image);
    }

    container.appendChild(questionLayout);

    const scaleDescriptions = document.createElement("div");
    scaleDescriptions.className = "mb-2 grid grid-cols-5 gap-3";

    getQuestionOptions(question).forEach(({ label }) => {
      const description = document.createElement("div");
      description.className =
        "flex min-h-10 items-end justify-center px-1 text-center text-base font-bold leading-tight text-[#30306f]/80";
      description.textContent = label;
      scaleDescriptions.appendChild(description);
    });

    container.appendChild(scaleDescriptions);

    const options = document.createElement("div");
    options.className = "grid grid-cols-5 gap-3";

    getQuestionOptions(question).forEach(({ value, label }) => {
      const isSelected = assessment.getAnswer(question.id)?.value === value;
      const button = document.createElement("button");
      button.className = getAnswerButtonClass(isSelected);
      button.dataset.questionId = String(question.id);
      button.dataset.value = String(value);
      button.setAttribute("aria-label", label || String(value));

      const answerImage = ANSWER_IMAGES[value];

      if (answerImage) {
        const image = document.createElement("img");
        image.className = `${ANSWER_IMAGE_SIZE} object-contain`;
        image.src = answerImage.src;
        image.alt = answerImage.alt;
        button.appendChild(image);
      }

      const valueText = document.createElement("span");
      valueText.className = "leading-tight";
      valueText.textContent = value;
      button.appendChild(valueText);

      options.appendChild(
        createAccessButton(button, () => {
          onAnswer(value);
        }),
      );
    });

    container.appendChild(options);
    return container;
  }

  createAssessmentNavigation({ assessment, onMoveQuestion, onShowResult }) {
    const navigation = document.createElement("div");
    navigation.className =
      "mb-[clamp(4vh,5vh,7vh)] mr-[clamp(3vw,4vw,6vw)] mt-[clamp(1vh,2vh,3vh)] flex min-h-[clamp(10vh,10vw,18vh)] justify-end gap-[clamp(2vw,3vw,4vw)]";

    const isFirstQuestion = assessment.questionIndex === 0;
    const isLastQuestion =
      assessment.questionIndex === assessment.questions.length - 1;

    if (!isFirstQuestion) {
      const previousButton = document.createElement("button");
      previousButton.className = `flex ${NAV_BUTTON_SIZE} cursor-pointer items-center justify-center rounded-lg border-2 border-[#b9ddec] bg-white/90 text-6xl font-bold text-[#30306f] shadow hover:border-[#0795a1] hover:bg-[#e4f6f4]`;
      previousButton.textContent = "<";
      previousButton.setAttribute("aria-label", "Previous");

      const previousAccessButton = createAccessButton(previousButton, () => {
        onMoveQuestion(-1);
      });
      previousAccessButton.setAttribute("access-group", "navigation");
      previousAccessButton.setAttribute("access-order", "1");
      navigation.appendChild(previousAccessButton);
    }

    if (!isLastQuestion) {
      const nextButton = document.createElement("button");
      nextButton.className = `flex ${NAV_BUTTON_SIZE} cursor-pointer items-center justify-center rounded-lg border-2 border-[#b9ddec] bg-white/90 text-6xl font-bold text-[#30306f] shadow hover:border-[#0795a1] hover:bg-[#e4f6f4]`;
      nextButton.textContent = ">";
      nextButton.setAttribute("aria-label", "Next");

      const nextAccessButton = createAccessButton(nextButton, () => {
        onMoveQuestion(1);
      });
      nextAccessButton.setAttribute("access-group", "navigation");
      nextAccessButton.setAttribute("access-order", "2");
      navigation.appendChild(nextAccessButton);
    }

    if (isLastQuestion) {
      const resultButton = document.createElement("button");
      resultButton.className = `${RESULT_BUTTON_SIZE} cursor-pointer rounded-lg border-2 border-[#0795a1] bg-[#0795a1] px-[clamp(2vw,3vw,4vw)] py-[clamp(2vh,3vh,4vh)] text-center text-3xl font-bold text-white shadow hover:bg-[#087b86]`;
      resultButton.textContent = "Result";

      const resultAccessButton = createAccessButton(resultButton, onShowResult);
      resultAccessButton.setAttribute("access-group", "navigation");
      resultAccessButton.setAttribute("access-order", "3");
      navigation.appendChild(resultAccessButton);
    }

    return navigation;
  }

  renderResult({ answersPayload, assessment }) {
    const container = document.createElement("main");
    container.className = "w-full max-w-5xl";

    const title = document.createElement("h1");
    title.className = "mb-5 text-3xl font-bold leading-tight";
    title.textContent = "Assessment answers";
    container.appendChild(title);

    const payload = document.createElement("pre");
    payload.className =
      "m-0 overflow-auto rounded-lg border border-[#b9ddec] bg-white/80 p-4";
    payload.textContent = JSON.stringify(
      answersPayload ?? assessment?.toAnswerPayload() ?? {},
      null,
      2,
    );
    container.appendChild(payload);

    return container;
  }

  renderMessage(message) {
    const container = document.createElement("main");
    container.className = "w-full max-w-3xl text-lg";
    container.textContent = message;
    return container;
  }

  updateAnswerSelection(root, questionId, selectedValue) {
    root
      .querySelectorAll(`[data-question-id="${questionId}"]`)
      .forEach((button) => {
        button.className = getAnswerButtonClass(
          Number(button.dataset.value) === selectedValue,
        );
      });
  }
}

function getQuestionOptions(question) {
  if (!question.scale) {
    return [];
  }

  const options = [];

  for (
    let value = question.scale.min;
    value <= question.scale.max;
    value += question.scale.step
  ) {
    options.push({
      value,
      label: question.scale.labels?.[value] ?? "",
    });
  }

  return options;
}
