import { Provider } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client, Pool } from 'pg';
import { PrismaService } from '../../prisma/prisma.service';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const TEMPLATE_DB_NAME = 'cesizen_template';

export class TestDbHelper {
  public testDbName: string;
  private baseDbUrl!: string;
  private testDbUrl!: string;
  public globalPool?: Pool;

  constructor(private prefix: string = 'cesizen_test') {
    this.testDbName = `${this.prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  }

  private static async ensureTemplate(baseDbUrl: string) {
    const client = new Client({ connectionString: baseDbUrl });
    await client.connect();
    
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${TEMPLATE_DB_NAME}'`);
    
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${TEMPLATE_DB_NAME}"`);
      const urlObj = new URL(baseDbUrl);
      urlObj.pathname = `/${TEMPLATE_DB_NAME}`;
      execSync('npx prisma db push --accept-data-loss', { 
        env: { ...process.env, DATABASE_URL: urlObj.toString() },
        stdio: 'inherit'
      });
    }
    await client.end();
  }

  async setupTestDb() {
    const originalDbUrl = process.env.DATABASE_URL;
    if (!originalDbUrl) throw new Error('DATABASE_URL missing');

    const urlObj = new URL(originalDbUrl);
    urlObj.pathname = '/postgres'; 
    this.baseDbUrl = urlObj.toString();
    
    urlObj.pathname = `/${this.testDbName}`;
    this.testDbUrl = urlObj.toString();

    await TestDbHelper.ensureTemplate(this.baseDbUrl);

    const client = new Client({ connectionString: this.baseDbUrl });
    await client.connect();
    await client.query(`CREATE DATABASE "${this.testDbName}" TEMPLATE "${TEMPLATE_DB_NAME}"`);
    await client.end();
  }

  async cleanupTestDb() {
    try {
      const client = new Client({ connectionString: this.baseDbUrl });
      await client.connect();
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${this.testDbName}'
        AND pid <> pg_backend_pid();
      `);
      await client.query(`DROP DATABASE IF EXISTS "${this.testDbName}"`);
      await client.end();
    } catch (err) {}
  }

  getPrismaProvider(): Provider {
    return {
      provide: PrismaService,
      useFactory: () => {
        this.globalPool = new Pool({ connectionString: this.testDbUrl, max: 2 });
        const adapter = new PrismaPg(this.globalPool);
        return new PrismaClient({ adapter }) as any;
      },
    };
  }

  async cleanupPrismaConnection(prisma: PrismaClient) {
    if (prisma) await (prisma as any).$disconnect();
    if (this.globalPool) {
      await this.globalPool.end();
      this.globalPool = undefined;
    }
  }
}
