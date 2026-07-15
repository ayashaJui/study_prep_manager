"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTE_MODEL = exports.NoteSchema = void 0;
const mongoose_1 = require("mongoose");
const noteSchema = new mongoose_1.Schema({
    topicId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', required: true },
    content: { type: String, required: true, minlength: 1 },
    tags: [{ type: String, trim: true }],
    pinned: { type: Boolean, default: false },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });
noteSchema.index({ userId: 1, topicId: 1 });
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, topicId: 1, pinned: -1, createdAt: -1 });
exports.NoteSchema = noteSchema;
exports.NOTE_MODEL = 'Note';
//# sourceMappingURL=note.schema.js.map