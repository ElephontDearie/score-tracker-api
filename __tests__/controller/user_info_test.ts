import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { serverStartUp } from '../../src/server/server';
import { Express } from 'express-serve-static-core';
import { ScoreTrackerUser, UserModel } from '../../src/models/user';
import { encryptPassword } from '../../src/controllers/user';


const mongooseURI = 'mongodb://127.0.0.1:27017/test';
let server: Express
let testUser: UserModel;
const rawPassword = 'testPass123';

beforeAll(async () => {
    const testApp = express();
    server = await serverStartUp(testApp, mongoose, mongooseURI)

    testUser = new ScoreTrackerUser({
        username: 'testUser1',
        password: await encryptPassword(rawPassword),
        email: 'test@testing.com'
    })
   
    await testUser.save();
    await ScoreTrackerUser.syncIndexes();
    
})

afterAll(async () => {
    await ScoreTrackerUser.deleteMany({});
    await mongoose.connection.close()
    await mongoose.disconnect()
})

describe('userAccessRouter POST path tests', () => {
    test('POST /:username returns 200 & updates data if user exists', done => {
        testUser && request(server).post('/access/' + testUser.username)
                        .send({username: testUser.username, firstStreet: 'testStreet'})
                        .expect(200)
                        .end((err, res) => {
                            if (err) {
                                return done(err)
                            }
                            expect(res.body).toMatchObject({userLevel: 'Limited'})
                            done();
                        })
    });
    test('POST /:username returns 404 & updates data if user unregistered', done => {
        testUser && request(server).post('/access/' + testUser.username)
                        .send({username: 'newUser1', firstStreet: 'testStreet'})
                        .expect(404, done)
    });
});
