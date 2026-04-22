import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TestDbHelper } from '../../../utils/test-db-helper';
import { ActivitiesService } from '../activities.service';
import { CreateActivitiesDto } from '../dto/createActivities.dto';

describe('ActivitiesService (Integration)', () => {
  let service: ActivitiesService;
  let dbHelper: TestDbHelper;
  let prisma: PrismaClient;

  beforeAll(async () => {
    dbHelper = new TestDbHelper('activities_service');
    await dbHelper.setupTestDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        dbHelper.getPrismaProvider(),
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    prisma = module.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  });

  afterAll(async () => {
    await dbHelper.cleanupPrismaConnection(prisma);
    await dbHelper.cleanupTestDb();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Activity Operations', () => {
    let typeId: string;

    beforeEach(async () => {
      await prisma.user_Activity.deleteMany();
      await prisma.activity.deleteMany();
      await prisma.user.deleteMany();
      await prisma.type_Activity.deleteMany();

      const type = await prisma.type_Activity.create({
        data: { name: 'Test Type' },
      });
      typeId = type.id;
    });

    it('should create an activity', async () => {
      const dto = {
        title: 'New Activity',
        description: 'Description',
        content: 'Content',
        url: 'http://test.com',
        typeId,
        updated_at: new Date(),
      };
      const activity = await service.create(dto as CreateActivitiesDto);
      expect(activity.title).toBe(dto.title);
      expect(activity.isSuspend).toBe(false);
    });

    it('should find an activity by id', async () => {
      const created = await prisma.activity.create({
        data: {
          title: 'Find Me',
          description: 'Desc',
          content: 'Content',
          url: 'http://test.com',
          typeId,
        },
      });
      const activity = await service.getActivitiesById(created.id);
      expect(activity.id).toBe(created.id);
    });

    it('should update an activity', async () => {
      const created = await prisma.activity.create({
        data: {
          title: 'Old Title',
          description: 'Desc',
          content: 'Content',
          url: 'http://test.com',
          typeId,
        },
      });
      const updated = await service.update(created.id, { title: 'New Title' });
      expect(updated.title).toBe('New Title');
    });

    it('should suspend and activate an activity', async () => {
      const created = await prisma.activity.create({
        data: {
          title: 'Status Test',
          description: 'Desc',
          content: 'Content',
          url: 'http://test.com',
          typeId,
        },
      });
      
      await service.suspend(created.id);
      let activity = await prisma.activity.findUnique({ where: { id: created.id } });
      expect(activity!.isSuspend).toBe(true);

      await service.activate(created.id);
      activity = await prisma.activity.findUnique({ where: { id: created.id } });
      expect(activity!.isSuspend).toBe(false);
    });

    it('should delete an activity', async () => {
      const created = await prisma.activity.create({
        data: {
          title: 'Delete Me',
          description: 'Desc',
          content: 'Content',
          url: 'http://test.com',
          typeId,
        },
      });
      await service.delete(created.id);
      const activity = await prisma.activity.findUnique({ where: { id: created.id } });
      expect(activity).toBeNull();
    });
  });

  describe('Favorite Operations', () => {
    let userId: string;
    let activityId: string;

    beforeEach(async () => {
      await prisma.user_Activity.deleteMany();
      await prisma.activity.deleteMany();
      await prisma.user.deleteMany();
      await prisma.type_Activity.deleteMany();

      const user = await prisma.user.create({
        data: {
          email: 'test@test.com',
          password: 'hash',
          first_name: 'John',
          last_name: 'Doe',
        },
      });
      userId = user.id;

      const type = await prisma.type_Activity.create({
        data: { name: 'Test Type' },
      });

      const activity = await prisma.activity.create({
        data: {
          title: 'Favorite Activity',
          description: 'Desc',
          content: 'Content',
          url: 'http://test.com',
          typeId: type.id,
        },
      });
      activityId = activity.id;
    });

    it('should add an activity to favorites', async () => {
      await service.addFavorite(userId, activityId);
      const favorite = await prisma.user_Activity.findUnique({
        where: { userId_activityId: { userId, activityId } },
      });
      expect(favorite).toBeDefined();
    });

    it('should remove an activity from favorites', async () => {
      await prisma.user_Activity.create({
        data: { userId, activityId },
      });
      
      await service.removeFavorite(userId, activityId);
      const favorite = await prisma.user_Activity.findUnique({
        where: { userId_activityId: { userId, activityId } },
      });
      expect(favorite).toBeNull();
    });
  });
});
