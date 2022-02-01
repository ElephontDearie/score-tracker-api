import { Schema, Document, Model, model, Types } from 'mongoose';

interface User extends Document {
    userId: Types.ObjectId;
    username: string;
    password: string;
    email: string;
    score: number;
    userLevel: UserLevel;
}

export enum UserLevel {
    Unauthenticated = "Not Authenticated",
    Restricted = "Restricted",
    Limited = "Limited",
    Unlimited = "Unlimited"
}


interface UserModel extends User {
    getScore: () => number;
}

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    score: {type: Number, default: 0},
    userId: String,
    userLevel: {
        type: String, 
        enum: [UserLevel.Unauthenticated, UserLevel.Restricted, UserLevel.Limited, UserLevel.Unlimited], 
        default: UserLevel.Unauthenticated
    }
});


userSchema.methods.getScore = function getScore(): number {
    return this.score;
}

export const ScoreTrackerUser = model<UserModel>('User', userSchema);
