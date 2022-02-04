import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { serverStartUp } from '../../src/server/server';
import { Express } from 'express-serve-static-core';
import { Question, Quiz, QuizModel } from '../../src/models/quiz';


const mongooseURI = 'mongodb://127.0.0.1:27017/test';
let server: Express
let testQuiz: QuizModel;

beforeAll(async () => {
    const testApp = express();

    server = await serverStartUp(testApp, mongoose, mongooseURI)
    testQuiz = new Quiz({
        name: 'testQuiz1',
        topic: 'testing',
        difficultyLevel: 'easy',
        questions: [{
            question: 'test question?',
            options: {'a': 'yes', 'b': 'no', 'c': 'not sure'},
            answer: {'a': 'yes'}
        }]
    })
   
    await testQuiz.save();
    await Quiz.syncIndexes();
    await Question.syncIndexes();
})

afterAll(async () => {
    await Quiz.deleteMany({});
    await Question.deleteMany({})
    await mongoose.connection.close()
    await mongoose.disconnect()

})

describe('quizRouter GET path tests', () => {
    test('GET / returns quiz list', done => {
        request(server).get('/quiz')
                        .expect(200)
                        .end((err, res) => {
                            if (err) {
                                return done(err)
                            }
                            expect(Object.keys(res.body)[0]).toContain('quizzes')
                            expect(Array.isArray(res.body.quizzes)).toBe(true);
                          
                            done();
                        })
    });

    test('GET /:id returns quiz with specified id', async() => {
 
        const existingQuiz = await Quiz.findOne({});

        const response = existingQuiz && await request(server).get('/quiz/' + existingQuiz.id);
        expect(response?.status).toEqual(200);
        expect(response?.body[0]._id).toEqual(existingQuiz?.id)
    });

});

describe('quizRouter DELETE path tests', () => {
    test('DELETE /:id deletes quiz with id in req.params', async () => {
        const deleteTestQuiz = new Quiz({
            name: 'testQuizToBeDeleted',
            topic: 'testQuizDeletion',
            difficultyLevel: 'easy',
            questions: [{
                question: 'should this test delete this quiz?',
                options: {'a': 'yes', 'b': 'no', 'c': 'not sure'},
                answer: {'a': 'yes'}
            }]
        })
        await deleteTestQuiz.save();
        await request(server).delete('/quiz/' + deleteTestQuiz._id)
                        .expect(204)
    });

    test('DELETE /:id/:questionId deletes question with id in req.params', async () => {
        const deleteTestQuestion = new Question({
            quizId: testQuiz._id,
            question: 'Create the next new test question for deletion test?',
            options: {'a': 'yes', 'b': 'no', 'c': 'not sure'},
            answer: {'a': 'yes'}
            
        })
        await deleteTestQuestion.save();

        await request(server).delete(`/quiz/${deleteTestQuestion.quizId}/${deleteTestQuestion._id}`)
                        .expect(204)
    });

});

describe('quizRouter POST path tests', () => {
    test('POST / posts quiz', (done) => {

        const data = {
            name: 'testQuizToBePOSTed',
            topic: 'testQuizPOST',
            difficultyLevel: 'easy',
            questions: [{
                question: 'should this test post this quiz?',
                options: {'a': 'yes', 'b': 'no', 'c': 'not sure'},
                answer: {'a': 'yes'}
            }]
        }
        request(server).post('/quiz/')
                        .send(data)
                        .expect(201, done);
    });

    test('POST /:id posts question with quizId in req.params', (done) => {

        const data = {
            quizId: testQuiz._id,
            question: 'is this a test to post a new question?',
            options: {'a': 'yes', 'b': 'no', 'c': 'not sure'},
            answer: {'a': 'yes'}
        }
        
        testQuiz._id && request(server).post('/quiz/' + data.quizId)
                        .send(data)
                        .expect(201, done)
         
    });

    afterAll(async() => {
        await Quiz.deleteOne({name: 'testQuizToBePOSTed'})
        await Question.deleteOne({name: 'should this test post a new question?'})
    })
});

describe('quizRouter PATCH path tests', () => {
    test('PATCH /:id/name edits quiz with id in req.params',  (done) => {

        const newName = {'newValue': 'testName'};

        testQuiz._id && request(server).patch(`/quiz/${testQuiz._id}/name`)
                        .set('Content-type', 'application/json')
                        .set('Accept', 'application/json')
                        .send(newName)
                        .expect(204, done)
    });

    test('PATCH /:id/topic edits quiz with id in req.params',  (done) => {

        const newTopic = {'newValue': 'testTopic'};

        testQuiz._id && request(server).patch(`/quiz/${testQuiz._id}/topic`)
                        .set('Content-type', 'application/json')
                        .set('Accept', 'application/json')
                        .send(newTopic)
                        .expect(204, done)
    });

    test('PATCH /:id/level edits quiz with id in req.params',  (done) => {

        const newLevel = {'newValue': 'advanced'};

        testQuiz._id && request(server).patch(`/quiz/${testQuiz._id}/level`)
                        .set('Content-type', 'application/json')
                        .set('Accept', 'application/json')
                        .send(newLevel)
                        .expect(204, done)
    });
});
