import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import { hydrateQuizData, quizRouter } from './controllers/quiz';
import  { hydrateUserData, userRouter } from './controllers/user';
import { userAccessRouter } from './controllers/user_access';
import { scoreRouter } from './controllers/score';

const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
const app = express();
mongoose.Promise = global.Promise



mongoose.connect(mongoURI)
  .then(() => {
    app.use(cors({ origin: 'http://localhost:3000' }))
    app.use(express.json());
    app.use('/', userRouter);
    app.use('/access', userAccessRouter)
    app.use('/quiz', quizRouter);
    app.use('/user', scoreRouter)
    hydrateQuizData('../seed_quiz_data.json').then(res => console.log(res)).catch(err => console.log(err))
    hydrateUserData('../seed_user_data.json').then(res => console.log(res)).catch(err => console.log(err))
    app.listen(port, () => {console.log(`API running on port ${port}`)})

  }).catch(err => console.log(err));
