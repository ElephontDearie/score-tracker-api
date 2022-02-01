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
    // questionId: Types.ObjectId;
    quizId: string;
    question: string;
    options: { a: string; b: string; c: string; };
    answer: Answer;
    dateAdded: Date;
}

type QuestionOptionKeys = 'a' | 'b' | 'c';

type Answer = {
    [key in QuestionOptionKeys]: string
}

export interface QuizModel extends Document {
    // quizId: Types.ObjectId;
    topic: {type: QuizTopic, required: true};
    name: {type: string, required: true};
    difficultyLevel: QuizDifficulty,
    questions: QuizQuestion[]
}

const QuizQuestionSchema = new Schema({
    // questionId: Types.ObjectId,
    quizId: {type: String, unique: false},
    question: {type: String, required: true, unique: true},
    options: {type: Array, required: true},
    answer: {type: Map, of: String, required: true},
    dateAdded: {type: Date, default: Date.now()}
});

const QuizSchema = new Schema({
    // quizId: Types.ObjectId,
    name: {type: String, required: true, unique: true},
    topic: String,
    difficultyLevel: {type: String, enum: QuizDifficulty, default: QuizDifficulty.Easy},
    questions: {type: [QuizQuestionSchema]}
});


export const Quiz = model<QuizModel>('Quiz', QuizSchema);
export const Question = model<QuizQuestion>('Question', QuizQuestionSchema);