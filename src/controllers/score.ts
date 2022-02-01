import { ScoreTrackerUser, UserLevel } from '../models/user';
import { ScoreTrackerUserInfo } from '../models/user_info';
import { Score } from '../models/score';
import { Router } from 'express';
import { Quiz } from '../models/quiz';

export const scoreRouter = Router();

scoreRouter.patch('/:username/score', async (req, res) => {
    const { username } = req.params;
    const { score, quizId } = req.body;

    const existingUser = await ScoreTrackerUser.findOne({username: username});
    if (existingUser) {
        existingUser.score += score;
        const existingScore = await Score.findOne({userId: existingUser._id});

        const quiz = await Quiz.findById({_id: quizId});
        const percentageCorrect = quiz && (score / quiz.questions.length) * 100;
        if (existingScore) {
            existingScore.score = score;
            await existingScore.save();
            return res.status(200).json({userScore: existingUser.score, quizScore: percentageCorrect});

        } else {
            const scoreUpdate = new Score ({
                userId: existingUser._id,
                quizId: quizId,
                score: score,
                percentageCorrect: percentageCorrect
            });
            await scoreUpdate.save();
            return res.status(201).json({userScore: existingUser.score, quizScore: percentageCorrect});

        }
       
        // return res.status(201).json(scoreUpdate);
    }
    return res.status(401).send("You are not a user. Please register or sign in to save your score.");

})
