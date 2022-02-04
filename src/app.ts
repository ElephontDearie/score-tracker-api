import express from 'express';
import mongoose from 'mongoose';

import { hydrateQuizData } from './controllers/quiz';
import  { hydrateUserData } from './controllers/user';
import { serverStartUp } from './server/server';

const port = process.env.PORT || 8000;
const localMongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/score_tracker';
export const app = express();
mongoose.Promise = global.Promise

serverStartUp(app, mongoose, localMongoURI).then(() => {
  hydrateQuizData('../seed_quiz_data.json').then(() => {}).catch(err => console.log(err))
  hydrateUserData('../seed_user_data.json').then(() => {}).catch(err => console.log(err))
  app.listen(port, () => {console.log(`API running on port ${port}`)})
}).catch(err => err);