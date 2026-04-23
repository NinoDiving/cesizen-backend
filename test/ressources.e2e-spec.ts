import { Role } from '@prisma/client';
import request from 'supertest';
import { E2EHelper } from './e2e-helper';
import * as bcrypt from 'bcryptjs';

describe('Ressources (e2e)', () => {
  let e2e: E2EHelper;
  let adminToken: string;
  let typeId: string;
  let illustrationId: string;

  beforeAll(async () => {
    e2e = new E2EHelper('ressources_e2e');
    await e2e.setup();

    const hashedPassword = await bcrypt.hash('password', 10);
    await e2e.prisma.user.create({
      data: {
        email: 'admin-res@example.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: Role.ADMIN,
      },
    });

    const adminLogin = await request(e2e.app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin-res@example.com', password: 'password' });
    adminToken = adminLogin.body.accessToken;

    const type = await e2e.prisma.type_Ressource.create({
      data: { name: 'Test Resource Type' },
    });
    typeId = type.id;

    const illustration = await e2e.prisma.illustration.create({
      data: { url: 'http://image.com' },
    });
    illustrationId = illustration.id;
  });

  afterAll(async () => {
    await e2e.cleanup();
  });

  let ressourceId: string;

  it('POST /admin/create-ressource (Admin should create ressource)', async () => {
    const ressourceData = {
      title: 'New Resource',
      description: 'Desc',
      content: 'Content',
      url: 'http://example.com/file.pdf',
      typeId: typeId,
      illustrationId: illustrationId,
    };

    const response = await request(e2e.app.getHttpServer())
      .post('/admin/create-ressource')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(ressourceData)
      .expect(201);

    ressourceId = response.body.id;
    expect(response.body.title).toBe(ressourceData.title);
  });

  it('GET /ressources (User should list ressources)', async () => {
    const response = await request(e2e.app.getHttpServer())
      .get('/ressources')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('GET /ressources/:id (User should view ressource)', async () => {
    const response = await request(e2e.app.getHttpServer())
      .get(`/ressources/${ressourceId}`)
      .expect(200);

    expect(response.body.id).toBe(ressourceId);
  });

  it('DELETE /admin/delete-ressource/:id (Admin should delete ressource)', async () => {
    await request(e2e.app.getHttpServer())
      .delete(`/admin/delete-ressource/${ressourceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(e2e.app.getHttpServer())
      .get(`/ressources/${ressourceId}`)
      .expect(404);
  });
});
