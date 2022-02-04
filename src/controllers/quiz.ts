import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Quiz, QuizTopic, QuizDifficulty, Question } from '../models/quiz';


const quizRouter = Router();

type UpdateQuizPropertyKey = 'name' | 'topic' | 'difficultyLevel';

interface Question {
    quizId: string;
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
    Quiz.find().then(quizzes => res.status(200).json({quizzes}))
                .catch(err => res.status(500).send(err)))
   
quizRouter.post('/', async (req: Request, res: Response) => {
    const { name, topic, difficultyLevel, questions } = req.body;
    const newQuiz = new Quiz({
        name,
        topic,
        difficultyLevel,
        questions
    });
    try {
        await newQuiz.save();
        return res.status(201).json(newQuiz)
    }
    catch (err: any) {
    
        console.log(err)
        return (err  &&  err.code == '11000') ? 
        res.status(409 ).json({message: 'duplicate question sent', err})
        : res.status(500).send(err);
    }
})

quizRouter.patch('/:id/name', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newValue } = req.body;
    try {
        const retrievedQuiz = await Quiz.findById(id);
        if (retrievedQuiz) {
            retrievedQuiz.name = newValue;
            await retrievedQuiz.save();
            return res.status(204).send();
        }
        return res.status(404).send('The specified Quiz object does not exist.')
    } catch (err) {
        return res.status(500).send(err)
    }
})

quizRouter.patch('/:id/topic', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newValue } = req.body;

    const retrievedQuiz = await Quiz.findById({_id: id}); 

    if (retrievedQuiz) {
        retrievedQuiz.topic = newValue;
        await retrievedQuiz.save();
        return res.status(204).send();
    }
    return res.status(404).send('The specified Quiz object does not exist.')
})

quizRouter.patch('/:id/level', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newValue } = req.body;

    const retrievedQuiz = await Quiz.findById({_id: id}); 
    if (retrievedQuiz) {
        retrievedQuiz.difficultyLevel = newValue;
        await retrievedQuiz.save();
        return res.status(204).send();
    }
    return res.status(404).send('The specified Quiz object does not exist.')
})
 
quizRouter.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await Quiz.deleteOne({_id: id});
        return res.status(204).send();
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
    const { question, answer, options } = req.body;
    

    const newQuestion = new Question({
        quizId: id,
        question,
        answer,
        options
    });

    try {
        const parentQuiz = await Quiz.findById(id);

        parentQuiz?.questions.push(newQuestion);

        await parentQuiz?.save();
        return res.status(201).json(newQuestion);
    } catch (err: any) {
        return (err  &&  err.code == '11000') ? 
        res.status(409 ).json({message: 'duplicate question or quiz name sent', err})
        : res.status(500).send(err);
    }
})

quizRouter.delete('/:id/:questionId', async (req: Request, res: Response) => {
    const { id, questionId } = req.params;
    Quiz.updateOne({
        '_id': id
    }, {
        $pull: {questions: { _id: questionId }}
    }, function (error: any, result: any) {
        if (error) {
            return res.status(500).send(error);
        } else {
            return res.status(204).send();
        }
    })
})



quizRouter.patch('/:id/:questionId/question', async (req: Request, res: Response) => {
    const { id, questionId } = req.params;
    const { newValue } = req.body;
    return patchQuestion(id, questionId, newValue, res, true);
})

quizRouter.patch('/:id/:questionId/answer', async (req: Request, res: Response) => {
    const { id, questionId } = req.params;
    const { newValue } = req.body;
    return patchQuestion(id, questionId, newValue, res);
})

const patchQuestion = (id: string, questionId: string, newValue: string, res: Response, isQuestion?: boolean) => {
    Quiz.findOne({_id: id, 'questions._id': questionId}).then(quiz => {
        const questionIndex = quiz && quiz.questions.findIndex(q => q._id.toString() == questionId)

        if (quiz && isNumber(questionIndex)) {
            const questionToPatch =  quiz.questions[(questionIndex)];
            if (isQuestion) {
                questionToPatch.question = newValue 
            } else {
                const key = Object.keys(newValue)[0];
                const val = Object.values(newValue)[0];

                questionToPatch.answer = {key: val};
            }
           
            quiz.save().then(() => res.status(204).send()).catch(err => res.status(500).send(err))
        } else {
            return res.status(404).send('Question with this id not found');
        }
    }).catch(err => res.status(500).send(err))
}

/** Method to hydrate initial quiz data into the Mongoose database on server start up */
export const hydrateQuizData = async (filePath: string) => {
    const seedData = fs.readFileSync(path.resolve(__dirname, filePath))
        .toString();

    const parsedArray: QuizInputType[] = JSON.parse(seedData);
    parsedArray.forEach(async quiz => {
        const presentQuiz = await Quiz.findOne({ name: quiz.name });
        if (presentQuiz) return;
        const newQuiz = new Quiz(quiz);

        newQuiz.questions.forEach(question => {
            question.quizId = newQuiz._id;

        })
        await newQuiz.save()

    });
}

/** Helper functions */
export const correctedTopicString = (topicString: string):string => topicString.toString().split('_')
                                                                    .map(word => word.replace('_', ' '))
                                                                    .join(' ');

const isNumber = (suppliedObject: number | null): suppliedObject is number => { 
    return suppliedObject != null;
                                                                    }
export { quizRouter};