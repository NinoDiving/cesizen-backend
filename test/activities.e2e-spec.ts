import { Role } from '@prisma/client';
import request from 'supertest';
import { E2EHelper } from './e2e-helper';
import * as bcrypt from 'bcryptjs';

describe('Activities (e2e)', () => {
  let e2e: E2EHelper;
  let adminToken: string;
  let userToken: string;
  let typeId: string;

  beforeAll(async () => {
    e2e = new E2EHelper('activities_e2e');
    await e2e.setup();

    const hashedPassword = await bcrypt.hash('password', 10);
    const admin = await e2e.prisma.user.create({
      data: {
        email: 'admin-act@example.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: Role.ADMIN,
      },
    });

    const user = await e2e.prisma.user.create({
      data: {
        email: 'user-act@example.com',
        password: hashedPassword,
        first_name: 'User',
        last_name: 'Test',
        role: Role.MEMBER,
      },
    });

    const adminLogin = await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin-act@example.com', password: 'password' });
    adminToken = adminLogin.body.accessToken;

    const userLogin = await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user-act@example.com', password: 'password' });
    userToken = userLogin.body.accessToken;

    const type = await e2e.prisma.type_Activity.create({
      data: { name: 'Test Type' },
    });
    typeId = type.id;
  });

  afterAll(async () => {
    await e2e.cleanup();
  });

  let activityId: string;

  it('POST /admin/create-activities (Admin should create activity)', async () => {
    const activityData = {
      title: 'New Activity',
      description: 'Desc',
      content: 'Content',
      url: 'http://example.com',
      updated_at: new Date().toISOString(),
      typeId: typeId,
    };

    const response = await request(e2e.app.getHttpServer())
      .post('/admin/create-activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(activityData)
      .expect(201);

    activityId = response.body.id;
    expect(response.body.title).toBe(activityData.title);
  });

  it('GET /activities/:id (User should view activity)', async () => {
    const response = await request(e2e.app.getHttpServer())
      .get(`/activities/${activityId}`)
      .expect(200);

    expect(response.body.id).toBe(activityId);
  });

  it('POST /activities/:id/favorite (User should add to favorites)', async () => {
    await request(e2e.app.getHttpServer())
      .post(`/activities/${activityId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);

    const favorite = await e2e.prisma.user_Activity.findFirst({
      where: { activityId },
    });
    expect(favorite).toBeDefined();
  });

  it('DELETE /activities/:id/favorite (User should remove from favorites)', async () => {
    await request(e2e.app.getHttpServer())
      .delete(`/activities/${activityId}/favorite`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    const favorite = await e2e.prisma.user_Activity.findFirst({
      where: { activityId },
    });
    expect(favorite).toBeNull();
  });

  it('DELETE /admin/delete-activities/:id (Admin should delete activity)', async () => {
    await request(e2e.app.getHttpServer())
      .delete(`/admin/delete-activities/${activityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(e2e.app.getHttpServer())
      .get(`/activities/${activityId}`)
      .expect(404);
  });
});
