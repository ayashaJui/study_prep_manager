import mongoose, { Document, Model } from 'mongoose';
export interface IStudySession {
    userId: mongoose.Types.ObjectId;
    topicId?: mongoose.Types.ObjectId | null;
    activityType: 'flashcard' | 'quiz' | 'note' | 'review';
    duration: number;
    score?: number;
    createdAt: Date;
}
export interface IStudySessionDocument extends IStudySession, Document {
}
export type IStudySessionModel = Model<IStudySessionDocument>;
export declare const StudySessionSchema: mongoose.Schema<IStudySessionDocument, IStudySessionModel, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IStudySessionDocument, mongoose.Document<unknown, {}, IStudySessionDocument, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<IStudySessionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IStudySessionDocument, mongoose.Document<unknown, {}, IStudySessionDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IStudySessionDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    createdAt?: mongoose.SchemaDefinitionProperty<Date, IStudySessionDocument, mongoose.Document<unknown, {}, IStudySessionDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IStudySessionDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    userId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IStudySessionDocument, mongoose.Document<unknown, {}, IStudySessionDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IStudySessionDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    topicId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, IStudySessionDocument, mongoose.Document<unknown, {}, IStudySessionDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IStudySessionDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    score?: mongoose.SchemaDefinitionProperty<number, IStudySessionDocument, mongoose.Document<unknown, {}, IStudySessionDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IStudySessionDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    activityType?: mongoose.SchemaDefinitionProperty<"review" | "flashcard" | "quiz" | "note", IStudySessionDocument, mongoose.Document<unknown, {}, IStudySessionDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IStudySessionDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    duration?: mongoose.SchemaDefinitionProperty<number, IStudySessionDocument, mongoose.Document<unknown, {}, IStudySessionDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<IStudySessionDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
}, IStudySessionDocument>;
export declare const STUDY_SESSION_MODEL = "StudySession";
