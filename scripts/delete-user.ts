import { prisma } from '@oreko/database';

async function deleteUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`User ${email} not found`);
      return;
    }

    // Delete the user (cascading deletes should handle related data)
    await prisma.user.delete({
      where: { email },
    });

    console.log(`User ${email} deleted successfully`);
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx ts-node scripts/delete-user.ts <email>');
  process.exit(1);
}

deleteUser(email);
