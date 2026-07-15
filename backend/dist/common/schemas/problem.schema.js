"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROBLEM_MODEL = exports.ProblemSchema = void 0;
const mongoose_1 = require("mongoose");
const problemSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', default: null },
    title: { type: String, required: true, trim: true },
    platform: { type: String, required: true, trim: true },
    problemNumber: { type: String, trim: true },
    url: { type: String, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    status: { type: String, enum: ['unsolved', 'attempted', 'solved'], default: 'unsolved' },
    tags: [{ type: String, trim: true }],
    notes: { type: String },
    timeComplexity: { type: String, trim: true },
    spaceComplexity: { type: String, trim: true },
    language: { type: String, trim: true },
    nextReview: { type: Date },
    reviewInterval: { type: Number, min: 0 },
    reviewCount: { type: Number, default: 0 },
    lastReviewedAt: { type: Date },
}, { timestamps: true });
problemSchema.index({ userId: 1, topicId: 1 });
problemSchema.index({ userId: 1, status: 1 });
problemSchema.index({ userId: 1, nextReview: 1 });
exports.ProblemSchema = problemSchema;
exports.PROBLEM_MODEL = 'Problem';
//# sourceMappingURL=problem.schema.js.map