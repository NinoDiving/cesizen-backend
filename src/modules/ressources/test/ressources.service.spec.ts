import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { RessourcesService } from '../ressources.service';

describe('RessourcesService (Integration)', () => {
  let service: RessourcesService;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;
  let typeId: string;
  let illustrationId: string;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('ressources_service');
    await dbHelper.setupTestDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RessourcesService,
        dbHelper.getPrismaProvider(),
      ],
    }).compile();

    service = module.get<RessourcesService>(RessourcesService);
    prisma = module.get<PrismaService>(PrismaService) as unknown as PrismaClient;

    const type = await prisma.type_Ressource.create({ data: { name: 'Video' } });
    const illustration = await prisma.illustration.create({ data: { url: 'http://img.com' } });
    typeId = type.id;
    illustrationId = illustration.id;
  });

  afterAll(async () => {
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  describe('Ressource Operations', () => {
    beforeEach(async () => {
      await prisma.theme_Menu.deleteMany();
      await prisma.ressource.deleteMany();
    });

    it('should create a ressource', async () => {
      const dto = {
        title: 'New Ressource',
        description: 'Desc',
        content: 'Content',
        url: 'http://test.com',
        typeId,
        illustrationId,
      };
      const ressource = await service.create(dto);
      expect(ressource.title).toBe(dto.title);
    });

    it('should find all ressources', async () => {
      await prisma.ressource.create({
        data: {
          title: 'R1',
          description: 'D1',
          content: 'C1',
          url: 'U1',
          typeId,
          illustrationId,
        },
      });
      const list = await service.findAll();
      expect(list.length).toBe(1);
    });

    it('should update a ressource', async () => {
      const created = await prisma.ressource.create({
        data: {
          title: 'Old',
          description: 'D',
          content: 'C',
          url: 'U',
          typeId,
          illustrationId,
        },
      });
      const updated = await service.update(created.id, { title: 'New' });
      expect(updated.title).toBe('New');
    });

    it('should delete a ressource', async () => {
      const created = await prisma.ressource.create({
        data: {
          title: 'Delete Me',
          description: 'D',
          content: 'C',
          url: 'U',
          typeId,
          illustrationId,
        },
      });
      await service.remove(created.id);
      const ressource = await prisma.ressource.findUnique({ where: { id: created.id } });
      expect(ressource).toBeNull();
    });
  });
});
