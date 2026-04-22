import { Test, TestingModule } from '@nestjs/testing';
import { ThemesService } from '../themes.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { PrismaClient } from '@prisma/client';

describe('ThemesService (Integration)', () => {
  let service: ThemesService;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('themes_service');
    await dbHelper.setupTestDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemesService,
        dbHelper.getPrismaProvider(),
      ],
    }).compile();

    service = module.get<ThemesService>(ThemesService);
    prisma = module.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  describe('Theme Operations', () => {
    beforeEach(async () => {
      await prisma.theme_Menu.deleteMany();
    });

    it('should create a theme without ressource', async () => {
      const dto = {
        name: 'No Ressource',
        display_order: 1,
        isVisible: true,
      };
      const theme = await service.create(dto);
      expect(theme.name).toBe(dto.name);
      expect(theme.ressourceId).toBeNull();
    });

    it('should list only visible themes ordered by display_order', async () => {
      await prisma.theme_Menu.create({
        data: { name: 'Hidden', isVisible: false, display_order: 1 },
      });
      await prisma.theme_Menu.create({
        data: { name: 'Second', isVisible: true, display_order: 2 },
      });
      await prisma.theme_Menu.create({
        data: { name: 'First', isVisible: true, display_order: 1 },
      });

      const list = await service.findAllVisible();
      expect(list.length).toBe(2);
      expect(list[0].name).toBe('First');
      expect(list[1].name).toBe('Second');
    });

    it('should update a theme', async () => {
      const created = await prisma.theme_Menu.create({
        data: { name: 'Old', isVisible: true, display_order: 1 },
      });
      const updated = await service.update(created.id, { name: 'New' });
      expect(updated.name).toBe('New');
    });

    it('should delete a theme', async () => {
      const created = await prisma.theme_Menu.create({
        data: { name: 'Delete', isVisible: true, display_order: 1 },
      });
      await service.remove(created.id);
      const theme = await prisma.theme_Menu.findUnique({ where: { id: created.id } });
      expect(theme).toBeNull();
    });
  });
});
