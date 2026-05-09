export class Question {
  constructor({
    id = null,
    question = null,
    imageUrl = null,
    base64 = null,
    responseType = "likert",
    scale = null,
  } = {}) {
    this.id = id;
    this.question = question;
    this.imageUrl = imageUrl;
    this.base64 = base64;
    this.responseType = responseType;
    this.scale = scale;

    this.answerValue = null;
  }
  // answer the question with a value
  answer(value) {
    this.answerValue = value;
    return this.answerValue;
  }
  // check if the question has been answered
  isAnswered() {
    return this.answerValue !== null;
  }

  // transform raw javascript object into a Question instance
  static fromData(data = {}) {
    return new Question(data);
  }
}
