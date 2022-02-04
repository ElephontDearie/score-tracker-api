import { Schema, Document, model, Types } from 'mongoose';

export enum QuizTopic {
    Econ = "Economics",
    Comp = "Computer Engineering"
}

export enum QuizDifficulty {
    Easy = "easy",
    Medium = "intermediate",
    Hard = "advanced"
}

export interface QuizQuestion extends Document {
    quizId: string;
    question: string;
    options: { a: string; b: string; c: string; };
    answer: {};
    dateAdded: Date;
}

type QuestionOptionKeys = 'a' | 'b' | 'c';

type Answer = {
    [key in QuestionOptionKeys]: string
}

export interface QuizModel extends Document {
    topic: string;
    name: string;
    difficultyLevel: QuizDifficulty,
    questions: QuizQuestion[]
}

const QuizQuestionSchema = new Schema({
    quizId: {type: Schema.Types.ObjectId, ref: 'Quiz'},
    question: {type: String, required: true, unique: true},
    options: {type: Array, required: true},
    answer: {type: Map, of: String, required: true},
    dateAdded: {type: Date, default: Date.now()}
});

const QuizSchema = new Schema({
    name: {type: String, required: true, unique: true},
    topic: {type: String, required: true, unique: false},
    difficultyLevel: {type: String, enum: QuizDifficulty, default: QuizDifficulty.Easy},
    questions: [QuizQuestionSchema]
});


export const Quiz = model<QuizModel>('Quiz', QuizSchema);
export const Question = model<QuizQuestion>('Question', QuizQuestionSchema);