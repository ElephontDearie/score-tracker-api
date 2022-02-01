import { Schema, Document, Model, model } from 'mongoose';

interface UserInfo extends Document {
    username: string;
    quizzesCompleted: number;
    firstStreet: string;
    dateOfBirth?: Date;
    maternalMaidenName?: string;
}

export interface UserInfoModel extends UserInfo {
    getQuizzesCompleted: () => number;
}

const userInfoSchema = new Schema({
    username: String,
    quizzesCompleted: {type: Number, default: 0},
    dateOfBirth: Date,
    maternalMaidenName: String,
    firstStreet: String
});


userInfoSchema.methods.getQuizzesCompleted = function getQuizzescompleted(): number {
    return this.quizzesCompleted;
}

export const ScoreTrackerUserInfo = model<UserInfoModel>('UserInfo', userInfoSchema);
