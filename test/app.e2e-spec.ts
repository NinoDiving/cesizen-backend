import request from 'supertest';
import { E2EHelper } from './e2e-helper';

describe('AppController (e2e)', () => {
  let e2e: E2EHelper;

  beforeAll(async () => {
    e2e = new E2EHelper('app_e2e');
    await e2e.setup();
  });

  afterAll(async () => {
    await e2e.cleanup();
  });

  it('/ (GET)', () => {
    return request(e2e.app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
