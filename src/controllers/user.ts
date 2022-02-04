import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ScoreTrackerUser, UserLevel } from '../models/user';
import { ScoreTrackerUserInfo } from '../models/user_info';
import { Score } from '../models/score';
import fs from 'fs';
import path from 'path';
import { MongoError, MongoServerError } from 'mongodb';

interface UserInputType {
    "username": string;
    "password": string;
    "email": string;
    "userLevel": UserLevel;
}

const userRouter = Router();

export const encryptPassword = async (password: string) => bcrypt.hash(password, 10);

userRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;

    ScoreTrackerUser.findOne({ username: req.body.username })
            .then(async user => {
                if (user){
                    const newPassword = await encryptPassword(password);
                    const passwordMatchesStored = await bcrypt.compare(password, user.password);

                    if (!passwordMatchesStored) {
                        return res.status(401).send('Incorrect password. Please try again.')
                    } 

                    return res.status(200).json({
                        email: user.email,
                        score: user.score,
                        userLevel: user.userLevel,
                        authToken: uuidv4()
                        });
                }
                return res.status(404).send('There is no account associated with these login details. Please register');
                
            }).catch(err => {
                console.log(err)
                return res.status(500).send(err);
            });
    
   
})

userRouter.post('/register', async (req: Request, res: Response) => {
    const { username, password, emailAddress } = req.body;
    const user = new ScoreTrackerUser({
        username: username,
        password: await encryptPassword(password),
        email: emailAddress,
        userLevel: UserLevel.Restricted
    });
    try {
        await user.save();
        return res.status(201).json({
            authToken: uuidv4(),
            score: user.score,
            email: user.email,
            userLevel: user.userLevel
        });
    } catch (err: any) {
        const statusCode = err  &&  err.code == '11000' ? 409 : 500;
        return res.status(statusCode).send(err);
    }   

})


/** Method to hydrate initial quiz data into the Mongoose database on server start up */
export const hydrateUserData = async (filePath: string) => {
    const seedData = fs.readFileSync(path.resolve(__dirname, filePath))
        .toString();

    const parsedArray: UserInputType[] = JSON.parse(seedData);
    parsedArray.forEach(async user => {
        
        const presentUser =  await ScoreTrackerUser.findOne({ name: user.username });

        if (presentUser) return;
        const newUser =  new ScoreTrackerUser({
            username: user.username,
            password: await encryptPassword(user.password),
            email: user.email,
            userLevel: user.userLevel
        });
        await newUser.save();
    });
}
export { userRouter };