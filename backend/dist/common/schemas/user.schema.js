"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_MODEL = exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    password: { type: String, select: false, minlength: 6 },
    avatar: { type: String, default: null },
    provider: { type: String, enum: ['credentials', 'google', 'github'], default: 'credentials' },
    googleId: { type: String, default: null },
    githubId: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationTokenExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    weeklyGoals: {
        type: [
            {
                metric: { type: String, enum: ['flashcards', 'quizzes', 'topics', 'notes'], required: true },
                label: { type: String, required: true, trim: true, maxlength: 100 },
                target: { type: Number, required: true, min: 1, max: 1000 },
            },
        ],
        default: undefined,
    },
}, { timestamps: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ githubId: 1 }, { sparse: true });
exports.UserSchema = userSchema;
exports.USER_MODEL = 'User';
//# sourceMappingURL=user.schema.js.map