import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase only allowed in test environment');
    }

    // Get all model names from Prisma
    const modelNames = Object.keys(this).filter(
      (key) => !key.startsWith('_') && !key.startsWith('$') && typeof (this as Record<string, unknown>)[key] === 'object',
    );

    for (const modelName of modelNames) {
      const model = (this as Record<string, unknown>)[modelName] as { deleteMany?: () => Promise<unknown> };
      if (model?.deleteMany) {
        await model.deleteMany();
      }
    }
  }
}
