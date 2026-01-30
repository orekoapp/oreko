import { prisma } from '@quotecraft/database';
import bcrypt from 'bcryptjs';

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      passwordHash: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    return null;
  }

  if (!user.passwordHash) {
    // User signed up with OAuth, doesn't have a password
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
