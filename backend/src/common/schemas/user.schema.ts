import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IWeeklyGoal {
  metric: 'flashcards' | 'quizzes' | 'topics' | 'notes';
  label: string;
  target: number;
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  provider?: string;
  googleId?: string;
  githubId?: string;
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  weeklyGoals?: IWeeklyGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}
export type IUserModel = Model<IUserDocument>;

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
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
  },
  { timestamps: true },
);

userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ githubId: 1 }, { sparse: true });

export const UserSchema = userSchema;
export const USER_MODEL = 'User';
