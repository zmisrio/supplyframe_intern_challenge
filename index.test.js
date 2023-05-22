const http = require('http');

describe('Test root path', () => {
    test('Status code should be 200', (done) => {
        http.get('http://localhost:3080/', (res) => {
            expect(res.statusCode).toBe(200);
            done();
        });
    });
});