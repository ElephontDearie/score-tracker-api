import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { Quiz, QuizModel, QuizTopic, QuizDifficulty, Question } from '../models/quiz';
import { ScoreTrackerUserInfo } from '../models/user_info';
import { Score } from '../models/score';


export const quizRouter = Router();

type UpdateQuizPropertyKey = 'name' | 'topic' | 'difficultyLevel';

interface Question {
    question: string;
    options: {[key: string]: string}[];
    answer: {[key: string]: string};
}

interface QuizInputType {
    topic: QuizTopic;
    name: string;
    difficultyLevel: QuizDifficulty, 
    questions: Question[];
}

/** router paths to get, post, edit, or delete quizzes */

quizRouter.get('/', async (req: Request, res: Response) => 
    // await Quiz.deleteMany();
    Quiz.find().then(quizzes => res.status(200).json({quizzes}))
                .catch(err => res.status(500).send(err)))
   
quizRouter.post('/', async (req: Request, res: Response) => {
    const { name, topic, difficultyLevel, questions } = req.body;
    const newQuiz = new Quiz(req.body);
    await newQuiz.save();
    return res.status(201).json(newQuiz);
})

quizRouter.patch('/:id/name', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newValue } = req.body;

    const retrievedQuiz = await Quiz.findById({_id: id});    // .updateOne({_id: id}, {$set: {propToUpdate: newValue}})

    if (retrievedQuiz) {
        retrievedQuiz.name = newValue;
        await retrievedQuiz.save();
        return res.status(204);
    }
    return res.status(404).send('The specified Quiz object does not exist.')
})

quizRouter.patch('/:id/topic', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newValue } = req.body;

    const retrievedQuiz = await Quiz.findById({_id: id});    // .updateOne({_id: id}, {$set: {propToUpdate: newValue}})

    if (retrievedQuiz) {
        retrievedQuiz.topic = newValue;
        await retrievedQuiz.save();
        return res.status(204);
    }
    return res.status(404).send('The specified Quiz object does not exist.')
})

quizRouter.patch('/:id/level', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newValue } = req.body;

    const retrievedQuiz = await Quiz.findById({_id: id});    // .updateOne({_id: id}, {$set: {propToUpdate: newValue}})

    if (retrievedQuiz) {
        retrievedQuiz.difficultyLevel = newValue;
        await retrievedQuiz.save();
        return res.status(204);
    }
    return res.status(404).send('The specified Quiz object does not exist.')
})
 
quizRouter.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await Quiz.deleteOne({_id: id});
        return res.status(204);
    } catch (err) {
        return res.status(500).send(err);
    }
});

/** Vaious GET paths to retrieve Quiz document data */
quizRouter.get('/topic', async (req: Request, res: Response) => 
    Quiz.find().distinct('topic').then(topics => res.status(200).json({topics}))
                                .catch(err => res.status(500).send(err)))

quizRouter.get('/:topic/level', async (req: Request, res: Response) => {
    const { topic } = req.params;
    return Quiz.find({topic: correctedTopicString(topic)}).distinct('difficultyLevel').then(levels => res.status(200).json({levels}))
                                .catch(err => res.status(500).send(err));
});

quizRouter.get('/:topic/:level', async (req: Request, res: Response) => {
    const { topic, level } = req.params;
    return Quiz.find({topic: correctedTopicString(topic), difficultyLevel: level}).select('name').then(quizNames => res.status(200).json({quizNames}))
                                .catch(err => res.status(500).send(err));
});

quizRouter.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    return Quiz.find({_id: id}).then(quiz => res.status(200).send(quiz)).catch(err => res.status(500).send(err));
})


/** router paths to post, delete or edit quiz questions */
quizRouter.post('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const newQuestion = new Question(req.body);
    try {
        await newQuestion.save();
        return res.status(201).json(newQuestion);
    } catch (err) {
        return res.status(500).send(err);
    }
})

quizRouter.delete('/:id/:questionId', async (req: Request, res: Response) => {
    const { id, questionId } = req.params;
    try {
        await Question.deleteOne({_id: questionId});
        return res.status(204);
    } catch (err) {
        return res.status(500).send(err);
    }
})

quizRouter.patch('/:id/:questionId/question', async (req: Request, res: Response) => {
    const { id, questionId } = req.params;
    const { newValue } = req.body;

    const retrievedQuestion = await Question.findById({_id: questionId});    // .updateOne({_id: id}, {$set: {propToUpdate: newValue}})

    if (retrievedQuestion) {
        retrievedQuestion.question = newValue;
        await retrievedQuestion.save();
        return res.status(204);
    }
    return res.status(404).send('The specified Quiz object does not exist.')
})

/** Method to hydrate initial quiz data into the Mongoose database on server start up */
export const hydrateQuizData = async (filePath: string) => {
    const seedData = fs.readFileSync(path.resolve(__dirname, filePath))
        .toString();

    const parsedArray: QuizInputType[] = JSON.parse(seedData);
    parsedArray.forEach(async quiz => {
        const newQuiz = new Quiz(quiz);
        const presentQuiz = newQuiz && await Quiz.findOne({ name: newQuiz.name }).then(res => res);
        if (presentQuiz) return;
        await newQuiz.save();
    });
}

const correctedTopicString = (topicString: string):string => topicString.toString().replace('_', ' ');

