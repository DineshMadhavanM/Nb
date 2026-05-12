const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Attempting to create a product with optional category...');
    const result = await prisma.product.create({
      data: {
        name: 'Test Product ' + Date.now(),
        price: 99,
        stock: 10,
        unit: 'pcs'
        // category is omitted
      }
    });
    console.log('Create successful:', result);
  } catch (error) {
    console.error('Create failed with error:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
