import { Role } from '@prisma/client';
import request from 'supertest';
import { E2EHelper } from './e2e-helper';
import * as bcrypt from 'bcryptjs';

describe('Themes (e2e)', () => {
  let e2e: E2EHelper;
  let adminToken: string;

  beforeAll(async () => {
    e2e = new E2EHelper('themes_e2e');
    await e2e.setup();

    const hashedPassword = await bcrypt.hash('password', 10);
    await e2e.prisma.user.create({
      data: {
        email: 'admin-theme@example.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: Role.ADMIN,
      },
    });

    const adminLogin = await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin-theme@example.com', password: 'password' });
    adminToken = adminLogin.body.accessToken;
  });

  afterAll(async () => {
    await e2e.cleanup();
  });

  let themeId: string;

  it('POST /admin/create-theme (Admin should create theme)', async () => {
    const themeData = {
      name: 'Stress Management',
      display_order: 1,
      isVisible: true,
    };

    const response = await request(e2e.app.getHttpServer())
      .post('/admin/create-theme')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(themeData)
      .expect(201);

    themeId = response.body.id;
    expect(response.body.name).toBe(themeData.name);
  });

  it('GET /themes (User should list themes)', async () => {
    const response = await request(e2e.app.getHttpServer())
      .get('/themes')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((t: any) => t.id === themeId)).toBe(true);
  });

  it('GET /themes/:id (User should view theme)', async () => {
    const response = await request(e2e.app.getHttpServer())
      .get(`/themes/${themeId}`)
      .expect(200);

    expect(response.body.id).toBe(themeId);
  });

  it('DELETE /admin/delete-theme/:id (Admin should delete theme)', async () => {
    await request(e2e.app.getHttpServer())
      .delete(`/admin/delete-theme/${themeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(e2e.app.getHttpServer())
      .get(`/themes/${themeId}`)
      .expect(404);
  });
});
