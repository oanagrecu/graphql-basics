import { PrismaClient } from '@prisma/client';

export interface Environment {
  db: PrismaClient;
}
