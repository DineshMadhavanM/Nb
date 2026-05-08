const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing products
  await prisma.product.deleteMany({});

  const products = [
    // Brownies
    { name: 'Classic Fudge Brownie', category: 'Brownie', price: 49, gstRate: 5, stock: 50, unit: 'pcs', image: 'https://images.unsplash.com/photo-1461008312844-e82701d1e570?w=200&h=200&fit=crop' },
    { name: 'Double Chocolate Brownie', category: 'Brownie', price: 65, gstRate: 5, stock: 40, unit: 'pcs', image: 'https://images.unsplash.com/photo-1543255006-d6395b6f1171?w=200&h=200&fit=crop' },
    { name: 'Triple Chocolate Brownie', category: 'Brownie', price: 69, gstRate: 5, stock: 35, unit: 'pcs', image: 'https://images.unsplash.com/photo-1564921924810-249ce57627cb?w=200&h=200&fit=crop' },
    { name: 'Hot Chocolate Brownie', category: 'Brownie', price: 79, gstRate: 5, stock: 30, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Nutella Brownie', category: 'Brownie', price: 99, gstRate: 5, stock: 25, unit: 'pcs', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200&h=200&fit=crop' },
    
    // Tres Leches (simplified as separate items for now)
    { name: 'Milk Cake (Half)', category: 'Tres Leches', price: 39, gstRate: 5, stock: 30, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Milk Cake (Full)', category: 'Tres Leches', price: 69, gstRate: 5, stock: 30, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Turkish Milk Cake (Half)', category: 'Tres Leches', price: 49, gstRate: 5, stock: 20, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Turkish Milk Cake (Full)', category: 'Tres Leches', price: 89, gstRate: 5, stock: 20, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Rosemilk Tres Leches (Half)', category: 'Tres Leches', price: 39, gstRate: 5, stock: 25, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Rosemilk Tres Leches (Full)', category: 'Tres Leches', price: 75, gstRate: 5, stock: 25, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Mocha Tres Leches (Half)', category: 'Tres Leches', price: 39, gstRate: 5, stock: 15, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Mocha Tres Leches (Full)', category: 'Tres Leches', price: 79, gstRate: 5, stock: 15, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Rasamalai Tres Leches (Half)', category: 'Tres Leches', price: 49, gstRate: 5, stock: 10, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Rasamalai Tres Leches (Full)', category: 'Tres Leches', price: 89, gstRate: 5, stock: 10, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },

    // Cookies
    { name: 'Chocochip Cookies', category: 'Cookies', price: 10, gstRate: 5, stock: 100, unit: 'pcs', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop' },
    { name: 'Chocolate Cookies', category: 'Cookies', price: 15, gstRate: 5, stock: 80, unit: 'pcs', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop' },

    // Muffins
    { name: 'Chocolate Muffins', category: 'Muffins', price: 20, gstRate: 5, stock: 40, unit: 'pcs', image: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=200&h=200&fit=crop' },
    { name: 'Banana Chocochip Muffins', category: 'Muffins', price: 25, gstRate: 5, stock: 35, unit: 'pcs', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop' },

    // Jar Cakes
    { name: 'Vanilla Caramel Jar Cake', category: 'Jar Cake', price: 70, gstRate: 5, stock: 20, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Black Forest Jar Cake', category: 'Jar Cake', price: 70, gstRate: 5, stock: 20, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Red Velvet Jar Cake', category: 'Jar Cake', price: 80, gstRate: 5, stock: 15, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },

    // Panna Cotta
    { name: 'Strawberry Panna Cotta', category: 'Panna Cotta', price: 75, gstRate: 5, stock: 12, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Blueberry Panna Cotta', category: 'Panna Cotta', price: 80, gstRate: 5, stock: 12, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },

    // Mousse
    { name: 'Oreo Mousse', category: 'Mousse', price: 75, gstRate: 5, stock: 15, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Kit Kat Mousse', category: 'Mousse', price: 80, gstRate: 5, stock: 15, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },

    // Refreshing Spl
    { name: 'Arabian Grapes Pulp', category: 'Beverages', price: 50, gstRate: 5, stock: 30, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Elaneer Payasam', category: 'Beverages', price: 90, gstRate: 5, stock: 20, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },

    // Mojito
    { name: 'Virgin Mojito', category: 'Mojito', price: 65, gstRate: 5, stock: 40, unit: 'pcs', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop' },
    { name: 'Blue Curacao Mojito', category: 'Mojito', price: 70, gstRate: 5, stock: 40, unit: 'pcs', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop' },
    { name: 'Watermelon Mojito', category: 'Mojito', price: 75, gstRate: 5, stock: 40, unit: 'pcs', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop' },

    // Snacks
    { name: 'Garlic Bread', category: 'Snacks', price: 25, gstRate: 5, stock: 30, unit: 'pcs', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=200&h=200&fit=crop' },
    { name: 'French Toast', category: 'Snacks', price: 40, gstRate: 5, stock: 20, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
    { name: 'Bread Omelet', category: 'Snacks', price: 50, gstRate: 5, stock: 20, unit: 'pcs', image: 'https://images.unsplash.com/photo-1511911063323-ab617859005c?w=200&h=200&fit=crop' },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('Database seeded with Nineteen06 menu!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
