import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Project'`;
        console.log('Columns in Project table:', result);
    } catch (error) {
        console.error('Error checking columns:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
