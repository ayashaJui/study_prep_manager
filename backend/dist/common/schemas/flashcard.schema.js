"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLASHCARD_MODEL = exports.FlashcardSchema = void 0;
const mongoose_1 = require("mongoose");
const flashcardSchema = new mongoose_1.Schema({
    topicId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    front: { type: String, required: true, minlength: 1 },
    back: { type: String, required: true, minlength: 1 },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    status: { type: String, enum: ['new', 'learning', 'review', 'mastered'], default: 'new' },
    confidence: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    lastReviewed: Date,
    nextReview: Date,
    easeFactor: { type: Number, default: 2.5, min: 1.3, max: 3.5 },
    intervalDays: { type: Number, default: 0, min: 0 },
    reviewCount: { type: Number, default: 0, min: 0 },
    importSource: {
        type: { type: String, enum: ['manual', 'csv', 'json', 'anki', 'quizlet', 'generated'] },
        fileName: String,
        importedAt: Date,
        batchId: String,
    },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });
flashcardSchema.index({ userId: 1, topicId: 1 });
flashcardSchema.index({ userId: 1, nextReview: 1 });
flashcardSchema.index({ userId: 1, status: 1 });
exports.FlashcardSchema = flashcardSchema;
exports.FLASHCARD_MODEL = 'Flashcard';
//# sourceMappingURL=flashcard.schema.js.map