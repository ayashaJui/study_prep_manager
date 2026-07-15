"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUIZ_MODEL = exports.QuizSchema = void 0;
const mongoose_1 = require("mongoose");
const questionSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    kind: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'] },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: mongoose_1.Schema.Types.Mixed, required: true },
    explanation: String,
    points: { type: Number, default: 1, min: 0 },
    tags: [{ type: String, trim: true }],
}, { _id: false });
const attemptSchema = new mongoose_1.Schema({
    attemptId: { type: mongoose_1.Schema.Types.ObjectId, default: () => new mongoose_1.default.Types.ObjectId() },
    date: { type: Date, default: Date.now },
    score: { type: Number, min: 0 },
    totalPoints: { type: Number, min: 0 },
    timeTaken: { type: Number, min: 0 },
    answers: [{ questionId: String, selectedAnswer: Number, isCorrect: Boolean, pointsEarned: { type: Number, default: 0 } }],
}, { _id: false });
const quizSchema = new mongoose_1.Schema({
    topicId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    source: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    type: { type: String, enum: ['multiple-choice', 'true-false', 'mixed', 'short-answer'], default: 'multiple-choice' },
    timeLimit: { type: Number, min: 1 },
    tags: [{ type: String, trim: true }],
    questions: { type: [questionSchema], validate: { validator: (q) => q.length > 0, message: 'Quiz must have at least one question' } },
    importSource: { type: mongoose_1.Schema.Types.Mixed, default: undefined },
    attempts: [attemptSchema],
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showAnswersImmediately: { type: Boolean, default: false },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
quizSchema.virtual('lastScore').get(function () {
    if (!this.attempts || this.attempts.length === 0)
        return null;
    const last = this.attempts[this.attempts.length - 1];
    if (!last.totalPoints)
        return '0%';
    return Math.round((last.score / last.totalPoints) * 100) + '%';
});
quizSchema.virtual('lastAttemptDate').get(function () {
    if (!this.attempts || this.attempts.length === 0)
        return null;
    return this.attempts[this.attempts.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});
quizSchema.virtual('attemptsCount').get(function () {
    return this.attempts ? this.attempts.length : 0;
});
quizSchema.index({ userId: 1, topicId: 1 });
quizSchema.index({ userId: 1, createdAt: -1 });
exports.QuizSchema = quizSchema;
exports.QUIZ_MODEL = 'Quiz';
//# sourceMappingURL=quiz.schema.js.map