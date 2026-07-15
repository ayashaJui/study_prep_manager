"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOPIC_MODEL = exports.TopicSchema = void 0;
const mongoose_1 = require("mongoose");
const topicSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    slug: { type: String, trim: true, lowercase: true, maxlength: 250 },
    description: { type: String, trim: true },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic', default: null },
    level: { type: Number, default: 0, min: 0 },
    path: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Topic' }],
    status: { type: String, enum: ['not-started', 'in-progress', 'review', 'mastered'], default: 'not-started' },
    tags: [{ type: String, trim: true }],
    favorite: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String },
    lastReviewed: Date,
    stats: {
        notesCount: { type: Number, default: 0 },
        flashcardsCount: { type: Number, default: 0 },
        quizzesCount: { type: Number, default: 0 },
        completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
topicSchema.virtual('progress').get(function () {
    return this.stats.completionPercentage;
});
topicSchema.pre('save', async function () {
    if (!this.isModified('parentId') || !this.parentId)
        return;
    if (this.parentId.equals(this._id))
        throw new Error('A topic cannot be its own parent');
    const parent = await this.constructor.findById(this.parentId).select('path');
    if (parent) {
        const ancestorIds = [...parent.path, parent._id];
        if (ancestorIds.some((id) => id.equals(this._id))) {
            throw new Error('Circular reference detected in topic hierarchy');
        }
    }
});
topicSchema.pre('save', async function () {
    if (this.isModified('name') || !this.slug) {
        const baseSlug = this.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        let slug = baseSlug;
        let counter = 1;
        const query = { slug, parentId: this.parentId, _id: { $ne: this._id } };
        if (this.userId)
            query.userId = this.userId;
        const Model = this.constructor;
        while (await Model.findOne(query)) {
            slug = `${baseSlug}-${counter}`;
            query.slug = slug;
            counter++;
        }
        this.slug = slug;
    }
});
topicSchema.index({ userId: 1, parentId: 1 });
topicSchema.index({ userId: 1, slug: 1 });
topicSchema.index({ userId: 1, parentId: 1, slug: 1 }, { unique: true });
topicSchema.index({ userId: 1, path: 1 });
topicSchema.index({ shareId: 1 }, { unique: true, sparse: true });
topicSchema.index({ isPublic: 1, createdAt: -1 });
topicSchema.index({ createdAt: -1 });
exports.TopicSchema = topicSchema;
exports.TOPIC_MODEL = 'Topic';
//# sourceMappingURL=topic.schema.js.map