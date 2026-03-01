const request = require('supertest');

let app;
beforeAll(() => {
  ({ app } = require('..'));
});

const hasEnv = !!process.env.DATABASE_URL && !!process.env.JWT_SECRET;
const testIf = (cond) => cond ? test : test.skip;

describe('integration (optional)', () => {
  testIf(hasEnv)('login returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@swipe.com', password: 'Admin123!' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('admin');
  });
});
