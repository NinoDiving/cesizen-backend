import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { E2EHelper } from './e2e-helper';

describe('Admin User Management (e2e)', () => {
  let e2e: E2EHelper;
  let adminToken: string;

  beforeAll(async () => {
    e2e = new E2EHelper('admin_e2e');
    await e2e.setup();

    const hashedPassword = await bcrypt.hash('password', 10);
    await e2e.prisma.user.create({
      data: {
        email: 'superadmin@example.com',
        password: hashedPassword,
        first_name: 'Super',
        last_name: 'Admin',
        role: Role.ADMIN,
      },
    });

    const loginRes = await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@example.com', password: 'password' });
    adminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await e2e.cleanup();
  });

  let testUserId: string;

  it('POST /admin/create-admin (Admin should create another admin)', async () => {
    const newAdmin = {
      email: 'newadmin@example.com',
      password: 'Password123!',
      first_name: 'New',
      last_name: 'Admin',
    };

    const response = await request(e2e.app.getHttpServer())
      .post('/admin/create-admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newAdmin)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    
    const userInDb = await e2e.prisma.user.findUnique({ where: { email: newAdmin.email } });
    expect(userInDb?.role).toBe(Role.ADMIN);
  });

  it('Setup a member for testing management', async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    const member = await e2e.prisma.user.create({
      data: {
        email: 'member@example.com',
        password: hashedPassword,
        first_name: 'Member',
        last_name: 'Test',
        role: Role.MEMBER,
      },
    });
    testUserId = member.id;
  });

  it('PATCH /admin/suspend-user/:id (Admin should suspend user)', async () => {
    await request(e2e.app.getHttpServer())
      .patch(`/admin/suspend-user/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const user = await e2e.prisma.user.findUnique({ where: { id: testUserId } });
    expect(user?.isSuspend).toBe(true);

    await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'member@example.com', password: 'password' })
      .expect(401);

    const loginRes = await request(e2e.app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'active-session@example.com', password: 'password', first_name: 'A', last_name: 'S' });
    const activeToken = loginRes.body.accessToken;
    const activeUserId = loginRes.body.userId;
    await request(e2e.app.getHttpServer())
      .patch(`/admin/suspend-user/${activeUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(e2e.app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${activeToken}`)
      .expect(401);
  });

  it('PATCH /admin/activate-user/:id (Admin should activate user)', async () => {
    await request(e2e.app.getHttpServer())
      .patch(`/admin/activate-user/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const user = await e2e.prisma.user.findUnique({ where: { id: testUserId } });
    expect(user?.isSuspend).toBe(false);
  });

  it('DELETE /admin/delete-user/:id (Admin should delete user)', async () => {
    await request(e2e.app.getHttpServer())
      .delete(`/admin/delete-user/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const user = await e2e.prisma.user.findUnique({ where: { id: testUserId } });
    expect(user).toBeNull();
  });

  it('Any route /admin (Non-admin should be rejected)', async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    await e2e.prisma.user.create({
      data: {
        email: 'simple@example.com',
        password: hashedPassword,
        first_name: 'Simple',
        last_name: 'User',
        role: Role.MEMBER,
      },
    });

    const loginRes = await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'simple@example.com', password: 'password' });
    const userToken = loginRes.body.accessToken;

    await request(e2e.app.getHttpServer())
      .post('/admin/create-admin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({})
      .expect(403);
  });
});
