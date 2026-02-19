import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        points: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
        },
        badges: {
          where: { isFeatured: true },
          include: { badge: true },
          take: 3,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        points: true,
      },
    });

    return this.sanitizeUser(user);
  }

  // ─── E2E Encryption Key Management ─────────────────────────

  async updateEncryptionKeys(
    userId: string,
    data: {
      publicKey: string;
      encryptedPrivateKey?: string;
      encryptedPrivateKeyNonce?: string;
      encryptionKeySalt?: string;
    }
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        encryptionPublicKey: data.publicKey,
        encryptedPrivateKey: data.encryptedPrivateKey,
        encryptedPrivateKeyNonce: data.encryptedPrivateKeyNonce,
        encryptionKeySalt: data.encryptionKeySalt,
      },
    });

    return { updated: true };
  }

  async getPublicKey(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { encryptionPublicKey: true },
    });
    return user?.encryptionPublicKey ?? null;
  }

  async getPublicKeys(userIds: string[]): Promise<{ userId: string; publicKey: string }[]> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, encryptionPublicKey: { not: null } },
      select: { id: true, encryptionPublicKey: true },
    });
    return users.map((u) => ({ userId: u.id, publicKey: u.encryptionPublicKey! }));
  }

  async getEncryptedPrivateKeyBackup(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        encryptedPrivateKey: true,
        encryptedPrivateKeyNonce: true,
        encryptionKeySalt: true,
      },
    });

    if (!user?.encryptedPrivateKey) {
      return null;
    }

    return {
      encryptedPrivateKey: user.encryptedPrivateKey,
      nonce: user.encryptedPrivateKeyNonce,
      salt: user.encryptionKeySalt,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, encryptedPrivateKey, encryptedPrivateKeyNonce, encryptionKeySalt, ...sanitized } = user;
    return sanitized;
  }
}
