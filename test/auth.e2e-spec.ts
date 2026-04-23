import request from 'supertest';
import { E2EHelper } from './e2e-helper';

describe('Auth (e2e)', () => {
  let e2e: E2EHelper;

  beforeAll(async () => {
    e2e = new E2EHelper('auth_e2e');
    await e2e.setup();
  });

  afterAll(async () => {
    await e2e.cleanup();
  });

  const testUser = {
    email: 'test-e2e@example.com',
    password: 'Password123!',
    first_name: 'John',
    last_name: 'Doe',
  };

  it('POST /auth/register (Should register a new user)', async () => {
    const response = await request(e2e.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('userId');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).not.toHaveProperty('password');
  });

  it('POST /auth/login (Should login and return JWT)', async () => {
    const response = await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
  });

  it('POST /auth/login (Should fail with wrong password)', async () => {
    await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('GET /users/me (Should access my profile with token)', async () => {
    const email = 'me-test@example.com';
    await request(e2e.app.getHttpServer())
      .post('/auth/register')
      .send({ ...testUser, email });
    const loginRes = await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: testUser.password });
    const token = loginRes.body.accessToken;
    const response = await request(e2e.app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.email).toBe(email);
    expect(response.body).not.toHaveProperty('password');
  });
});
