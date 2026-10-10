import { User, Prisma } from '@prisma/client';
import { prisma } from '../../core/database.js';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { department: true },
    });
  }

  async findByRollNo(rollNo: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { rollNo },
      include: { department: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
      include: { department: true },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
      include: { department: true },
    });
  }
}

export const authRepository = new AuthRepository();
