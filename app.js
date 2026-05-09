import { Question } from "./models/Question.js";
import { Assessment } from "./models/Assessment.js";

const DEFAULT_QUESTION_BANK_URL = "./default-question-bank.json";

class PainManagementApp {
  constructor() {
    this.assessmentId = null;
    this.assessmentQuestionCache = new Map();
    this.assessment = null;
    this.persistence = {
      default_bank: (assessmentId) => this._fetchFromDefaultBank(assessmentId),
      database: (assessmentId) => this._fetchFromDatabase(assessmentId),
    };
  }

  init() {
    console.log(this.fetchAssessment());
  }

  addListeners() {
    SquidlyAPI.firebaseOnValue("assessmentId", (value) => {
      this.assessmentId = value;
    });
  }

  async fetchAssessment(assessmentId, source = "default_bank") {
    if (this.assessmentQuestionCache.has(assessmentId)) {
      return this.assessmentQuestionCache.get(assessmentId);
    }

    const persistence = this.persistence[source];

    if (!persistence) {
      throw new Error(`Unknown question source: ${source}`);
    }

    const assessment = await persistence(assessmentId);
    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }
    const assessmentObj = new Assessment(assessment);

    this.assessmentQuestionCache.set(assessmentId, assessmentObj);
    return assessmentObj;
  }

  // Private methods:

  // Persistence implementations
  async _fetchFromDefaultBank(assessmentId = "fear-of-pain") {
    if (!assessmentId) {
      throw new Error("assessmentId is required");
    }

    const response = await fetch(DEFAULT_QUESTION_BANK_URL);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch default question bank: ${response.status}`,
      );
    }

    const bank = await response.json();
    const assessment = bank[assessmentId];

    if (!assessment) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }

    return assessment;
  }
  async _fetchFromDatabase(assessmentId = null) {
    // to be implemented; shape must be aligned with Assessment dataclass
  }
}
const app = new PainManagementApp();
app.init();
