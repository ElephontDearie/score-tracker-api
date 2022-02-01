import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { serverStartUp } from '../../src/server/server';
import { Express } from 'express-serve-static-core';
import { ScoreTrackerUser, UserLevel, UserModel } from '../../src/models/user';
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

describe('userRouter POST path tests', () => {
    test('POST /login returns 200 if user exists', done => {
        testUser && request(server).post('/login')
                        .send({username: testUser.username, password: rawPassword})
                        .expect(200)
                        .end((err, res) => {
                            if (err) {
                                return done(err)
                            }

                            expect(Object.keys(res.body)).toContain('email')
                            expect(Object.keys(res.body)).toContain('score')
                            expect(Object.keys(res.body)).toContain('userLevel')

                            done();
                        })
    });

    test('POST /login returns 404 if user is new', done => {
        request(server).post('/login')
                    .send({username: 'newUsername', password: 'newPass'})
                    .expect(404)
                    .end((err, res) => {
                        if (err) {
                            return done(err)
                        }
                        done();
                    })
    });

    test('POST /register returns 201 if user is new', done => {
        const data = {username: 'newbie', password: 'newbiePass', emailAddress: 'newbie@new.com'} 
        request(server).post('/register')
                    .send(data)
                    .expect(201, done)
                
    });
    test('POST /register returns 409 if user is not new', done => {
        const data = {username: testUser.username, password: testUser.password, emailAddress: testUser.email} 
        request(server).post('/register')
                    .send(data)
                    .expect(409, done)
                
    });

});
