const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- Products Routes ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (error) {
    console.error("POST Products Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(product);
  } catch (error) {
    console.error("PUT Products Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    console.error("DELETE Products Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Orders Routes ---
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, Customer: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error("GET Orders Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, customerName, items, subtotal, discount, total, paymentMethod } = req.body;
    
    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          id: `ORD-${Date.now()}`,
          customerId,
          customerName,
          subtotal,
          discount,
          total,
          paymentMethod,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              qty: item.qty
            }))
          }
        }
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } }
        });
      }

      // Update customer total spent and loyalty points
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalSpent: { increment: total },
            loyaltyPoints: { increment: Math.floor(total / 100) }
          }
        });
      }

      // Create Invoice automatically
      await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          orderId: newOrder.id
        }
      });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Customers Routes ---
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { Orders: true }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const customer = await prisma.customer.create({ data: req.body });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Analytics & Reports ---
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: today } }
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = await prisma.order.count();
    
    // Simplified AI Sales Prediction (Mocked logic for demo)
    const predictions = [
      { day: 'Mon', predicted: 4500 },
      { day: 'Tue', predicted: 5200 },
      { day: 'Wed', predicted: 3900 },
      { day: 'Thu', predicted: 6100 },
      { day: 'Fri', predicted: 8500 },
      { day: 'Sat', predicted: 11000 },
      { day: 'Sun', predicted: 9500 },
    ];

    res.json({
      todayRevenue,
      todayOrders: todayOrders.length,
      totalOrdersCount,
      predictions
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
