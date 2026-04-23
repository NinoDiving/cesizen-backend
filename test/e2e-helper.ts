import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { TestDbHelper } from '../src/utils/test-db-helper';

export class E2EHelper {
  public app!: INestApplication;
  public dbHelper: TestDbHelper;
  public prisma!: PrismaClient;

  constructor(prefix: string = 'e2e') {
    this.dbHelper = new TestDbHelper(prefix);
  }

  async setup() {
    await this.dbHelper.setupTestDb();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(await (this.dbHelper.getPrismaProvider() as any).useFactory())
      .compile();

    this.app = moduleFixture.createNestApplication();

    this.app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await this.app.init();
    this.prisma = moduleFixture.get<PrismaService>(PrismaService) as unknown as PrismaClient;
  }

  async cleanup() {
    if (this.app) {
      await this.app.close();
    }
    if (this.prisma) {
      await this.dbHelper.cleanupPrismaConnection(this.prisma);
    }
    await this.dbHelper.cleanupTestDb();
  }
}
