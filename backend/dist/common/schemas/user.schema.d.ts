import mongoose, { Document, Model } from 'mongoose';
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
export interface IUserDocument extends IUser, Document {
}
export type IUserModel = Model<IUserDocument>;
export declare const UserSchema: mongoose.Schema<IUserDocument, IUserModel, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    createdAt?: mongoose.SchemaDefinitionProperty<Date, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    updatedAt?: mongoose.SchemaDefinitionProperty<Date, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    name?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    email?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    password?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    avatar?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    provider?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    googleId?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    githubId?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    emailVerified?: mongoose.SchemaDefinitionProperty<boolean, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    verificationToken?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    verificationTokenExpiry?: mongoose.SchemaDefinitionProperty<Date, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    resetToken?: mongoose.SchemaDefinitionProperty<string, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    resetTokenExpiry?: mongoose.SchemaDefinitionProperty<Date, IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    weeklyGoals?: mongoose.SchemaDefinitionProperty<IWeeklyGoal[], IUserDocument, mongoose.Document<unknown, {}, IUserDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
}, IUserDocument>;
export declare const USER_MODEL = "User";
