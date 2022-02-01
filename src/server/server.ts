import cors from "cors";
import express, {Express} from "express";
import { Mongoose } from "mongoose";
import { quizRouter } from "../controllers/quiz";
import { scoreRouter } from "../controllers/score";
import { userRouter } from "../controllers/user";
import { userAccessRouter } from "../controllers/user_access";
import { Question, Quiz } from "../models/quiz";
import { ScoreTrackerUser } from "../models/user";

export const serverStartUp = async (expressServer: Express, mongooseAgent: Mongoose, mongooseURI: string): Promise<Express> => {
    await mongooseAgent.connect(mongooseURI);
    expressServer.use(cors())
    expressServer.use(express.json());
    expressServer.use('/', userRouter);
    expressServer.use('/access', userAccessRouter)
    expressServer.use('/quiz', quizRouter);
    expressServer.use('/user', scoreRouter)

    await Quiz.syncIndexes();
    await Question.syncIndexes();
    await ScoreTrackerUser.syncIndexes();
    
    return expressServer;
  }