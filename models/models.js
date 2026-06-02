const ANSWER_IMAGES = {
  0: { src: "images/happy.png", alt: "Happy" },
  1: { src: "images/smile.png", alt: "Smile" },
  2: { src: "images/neutral.png", alt: "Neutral" },
  3: { src: "images/sad.png", alt: "Sad" },
  4: { src: "images/crying.png", alt: "Crying" },
};

class DataClass {
    /**
     * Creates an instance of the class and populates its properties based on the provided arguments object.
    * @template {DataClass} T
    * @this {new() => T}
    * @param {Object} argsObject
    * @returns {T}
    */
    static make(argsObject) {
        const instance = new this();
        for (const key in instance) {
            if (!(instance[key] instanceof Function)) {
                if (key in argsObject) {
                    let parser = key + "_parser";
                    if (parser in this && this[parser] instanceof Function) {
                        instance[key] = this[parser](argsObject[key]);
                    } else {
                        instance[key] = argsObject[key];
                    }
                } else if (instance[key] === undefined) {
                    throw new Error(`${this.constructor.name}: Missing required property: ${key}`);
                }
            }
        }

        if ("validate" in instance && instance.validate instanceof Function) {
            instance.validate();
        }
        return instance;
    }


    /**
     * Creates an instance of the class and populates its properties based on the provided arguments object.
    * @template {DataClass} T
    * @this {new() => T}
    * @param {string} url - The URL to load the data from, which should return a JSON object.
    * @param {function(number):void} onprogress - An optional callback function that receives progress updates as a number between 0 and 1.
    * @returns {Promise<T>}
    */
    static async load(url, onprogress) {
        const data = await loadFile(url, "json", onprogress);
        return this.make(data);
    }
}

class ImageInfo extends DataClass {
    /** @type {string} */
    src = null;
    
    /** @type {string|null} */
    alt = null;
}

class Scale extends DataClass {
    /** @type {number} */
    min = 0;

    /** @type {number} */
    max = 0;

    /** @type {number} */
    step = 1;

    /** @type {string[]} */
    options = [];
    static options_parser(o) { return Array.isArray(o) ? [...o] : [] }

    /** @type {Object} */
    labels = {};

    get values() {
        let values = this.options;
        if (this.options.length === 0) {
            const { min, max, step } = this;
            for (let v = min; v <= max; v += step) {
                values.push(v);
            }
        }
        return values;
    }
}


/** Store one answer for one assessment question. */
class Answer extends DataClass {
    /** @type {string|number} */
    assessmentId = null;

    /** @type {string|number} */
    questionId = null;

    /** @type {string|number} */
    value = null;

    /** @type {string} */
    answeredAt = new Date().toISOString();

    isAnswered() {
        return this.value !== null;
    }

    /** Convert the answer into the remote payload shape. */
    toPayload() {
        return {
            questionId: this.questionId,
            value: this.value,
            answeredAt: this.answeredAt,
        };
    }
}


/** Store question-bank data for one question. */
class Question extends DataClass {
    /**@type {string|number} */
    id = null;

    /**@type {string} */
    question = null;

    /**@type {string} */
    customUtterance = null;

    /**@type {string|null} */
    imageUrl = null;

    /**@type {string|null} */
    base64 = null;

    /**@type {string} */
    responseType = "likert";

    /**@type {Scale} */
    scale = null;
    static scale_parser(s) { return s ? Scale.make(s) : null }


    get utterance() {
        return this.customUtterance ?? this.question;
    }
}



/** Manage questions, current position, and answer state. */
class Assessment extends DataClass {
    /** Create an assessment with question models and answer state. */

    /**@type {string|number} */
    id = null;

    /**@type {string} */
    title = "";

    /**@type {string} */
    description = "";

    /**@type {string} */
    version = "";

    /** @type {Question[]} */
    questions = [];
    static questions_parser(q) { return Array.isArray(q) ? q.map(i => Question.make(i)) : [] }

    /** @type {number} */
    questionIndex = 0;

    /** @type {Object<string, ImageInfo>} */
    answerImages = {}; //{...ANSWER_IMAGES};
    static answerImages_parser(ai) {
        let images = {};
        if (ai && typeof ai === "object") {
            for (let key in ai) {
                images[key] = ImageInfo.make(ai[key]);
            }
        } else {
            // images = {...ANSWER_IMAGES};
        }
        return images;
    }

    /** @type {Map<string|number, Answer>} */
    answers = new Map();
    static answers_parser(a) {
        let newA = new Map();
        if (a instanceof Map) {
            for (let [k, v] of a.entries()) {
                newA.set(k, Answer.make(v));
            }
        } else if (Array.isArray(a)) {
            for (let i of a) {
                let answer = Answer.make(i);
                newA.set(answer.questionId, answer);
            }
        }
        return newA;
    }

    getQuestionById(questionId) {
        return this.questions.find((q) => q.id === questionId) ?? null;
    }

    /** 
     * Return the question at the current index, or null when unavailable.
     * @return {Question|null} The current question or null if index is out of bounds.
     */
    currentQuestion() {
        return this.questions[this.questionIndex] ?? null;
    }

    get currentQuestionId() {
        const question = this.currentQuestion();
        return question ? question.id : null;
    }

    /** Move the current question index within the assessment bounds. */
    moveQuestion(step) {
        this.questionIndex = Math.max(
            0,
            Math.min(this.questions.length - 1, this.questionIndex + step),
        );
    }

    /** Record an answer for a specific question. */
    answerQuestion(questionId, value) {
        if (!this.questions.some((question) => question.id === questionId)) {
            throw new Error(`Question not found: ${questionId}`);
        }

        const answer = Answer.make({
            assessmentId: this.id,
            questionId,
            value,
        });

        this.answers.set(questionId, answer);
        return answer;
    }

    /** Record an answer for the current question. */
    answerCurrentQuestion(value) {
        const question = this.currentQuestion();

        if (!question) {
            throw new Error("No current question to answer");
        }

        return this.answerQuestion(question.id, value);
    }

    /** Return the answer for a question, or null when unanswered. */
    getAnswer(questionId) {
        return this.answers.get(questionId) ?? null;
    }

    get currentQuestionAnswer() {
        const questionId = this.currentQuestionId;
        return questionId ? this.getAnswer(questionId) : null;
    }

    /** Convert answer state into the payload saved remotely. */
    toAnswerPayload() {
        return {
            assessmentId: this.id,
            assessmentVersion: this.version,
            questionIndex: this.questionIndex,
            updatedAt: new Date().toISOString(),
            answers: Array.from(this.answers.values(), (answer) => answer.toPayload()),
        };
    }

    /** Check whether a question has a non-null answer. */
    isQuestionAnswered(questionId) {
        return (
            this.answers.has(questionId) && this.answers.get(questionId).isAnswered()
        );
    }

    /** Check whether the final question is reached and all questions are answered. */
    isComplete() {
        return (
            this.questionIndex === this.questions.length - 1 &&
            this.questions.every((question) => this.isQuestionAnswered(question.id))
        );
    }
}


export {Scale, Answer, Question, Assessment}
