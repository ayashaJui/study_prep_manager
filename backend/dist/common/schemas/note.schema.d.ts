import mongoose, { Document, Model } from 'mongoose';
export interface INote {
    topicId: mongoose.Types.ObjectId;
    content: string;
    tags: string[];
    pinned: boolean;
    userId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface INoteDocument extends INote, Document {
}
export type INoteModel = Model<INoteDocument>;
export declare const NoteSchema: mongoose.Schema<INoteDocument, INoteModel, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, "id"> & mongoose.HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    createdAt?: mongoose.SchemaDefinitionProperty<Date, INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    updatedAt?: mongoose.SchemaDefinitionProperty<Date, INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    userId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    tags?: mongoose.SchemaDefinitionProperty<string[], INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    topicId?: mongoose.SchemaDefinitionProperty<mongoose.Types.ObjectId, INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    content?: mongoose.SchemaDefinitionProperty<string, INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
    pinned?: mongoose.SchemaDefinitionProperty<boolean, INoteDocument, mongoose.Document<unknown, {}, INoteDocument, {
        id: string;
    }, mongoose.DefaultSchemaOptions> & Omit<INoteDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & mongoose.HydratedDocumentOverrides<{
        id: string;
    }>>;
}, INoteDocument>;
export declare const NOTE_MODEL = "Note";
