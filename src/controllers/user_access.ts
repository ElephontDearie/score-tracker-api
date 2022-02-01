import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ScoreTrackerUser, UserLevel } from '../models/user';
import { ScoreTrackerUserInfo } from '../models/user_info';
import { Score } from '../models/score';


const userAccessRouter = Router();

userAccessRouter.post('/access', async (req, res) => {
    const { username, quizComplete } = req.body;
    console.log('page being constructed')
})

userAccessRouter.post('/:username', async (req, res) => {
    const {firstStreet, username} = req.body;
    const user = await ScoreTrackerUser.findOne({username: username});

    if (user) {
        const existingUserInfo = await  ScoreTrackerUserInfo.findOne({username: username});

        if (existingUserInfo) {
            existingUserInfo.firstStreet = firstStreet;
        } 
        const userInfo = existingUserInfo? existingUserInfo : new ScoreTrackerUserInfo({
            username: user.username,
            firstStreet: firstStreet
        });
        
        user.userLevel = UserLevel.Limited;
        try {
            await userInfo.save();
            await user.save();

            return res.status(200).send({userLevel: user.userLevel});
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }   
    }
    return res.status(404).send('Username not registered');

    
})

// userAccessRouter.get('/:username', async (req, res) => {
//    await ScoreTrackerUserInfo.findByIdAndUpdate("61f6c0de52f346ccb4afe0e8", {$set: {firstStreet: 'Maple'}});
//    const info = await ScoreTrackerUserInfo.find();
//     const { username } = req.params;
//     return res.send(info)
// })
export { userAccessRouter };
