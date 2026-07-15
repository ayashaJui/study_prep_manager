"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STUDY_SESSION_MODEL = exports.StudySessionSchema = void 0;
const mongoose_1 = require("mongoose");
const studySessionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', default: null },
    activityType: { type: String, enum: ['flashcard', 'quiz', 'note', 'review'], required: true },
    duration: { type: Number, default: 0, min: 0 },
    score: { type: Number, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false });
studySessionSchema.index({ userId: 1, createdAt: -1 });
exports.StudySessionSchema = studySessionSchema;
exports.STUDY_SESSION_MODEL = 'StudySession';
//# sourceMappingURL=study-session.schema.js.map