import { Schema, Document, Model, model } from 'mongoose';

interface Score extends Document {
    userId: string;
    quizId: string;
    score: number;
    percentageCorrect: number;
}

interface ScoreModel extends Score {
    getQuizScore: () => number;
    getQuizPercentage: () => number;
}

const ScoreSchema = new Schema({
    userId: String,
    quizId: String,
    score: Number,
    percentageCorrect: Number
});


ScoreSchema.methods.getQuizScore = function getQuizScore(): number {
    return this.score ? this.score : 0;
}

ScoreSchema.methods.getQuizPercentage = function getQuizPercentage(): number {
    return this.percentageCorrect ? this.percentageCorrect : 0;
}

export const Score = model<ScoreModel>('Score', ScoreSchema);