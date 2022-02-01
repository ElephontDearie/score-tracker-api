import { correctedTopicString } from '../../src/controllers/quiz';

describe('correctedTopicString() returns expected topic string', () => {
    it('should replace underscores with spaces', () => {
        expect(correctedTopicString('Computer_Engineering')).toEqual('Computer Engineering');
    });

    it('should replace underscores at different positions inside sentence string with spaces', () => {
        expect(correctedTopicString('Computer_Engineering_Topic')).toEqual('Computer Engineering Topic');
    });
})