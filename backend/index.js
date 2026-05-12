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

app.get('/', (req, res) => {
  res.send('Nineteen06 POS API is running...');
});

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
    const { id: _, createdAt, updatedAt, ...updateData } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: updateData
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
    const deleted = await prisma.product.deleteMany({ where: { id } });
    if (deleted.count === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
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
    const { customerId, customerName, customerPhone, items, subtotal, gst, discount, total, paymentMethod, dueDate } = req.body;
    
    const payStatus = paymentMethod === 'Credit' ? 'unpaid' : 'paid';

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      let finalCustomerId = customerId;

      // Automatically create or find customer if phone is provided but no ID
      if (!finalCustomerId && customerPhone && customerName !== 'Walk-in Customer') {
        const existingCustomer = await tx.customer.findUnique({
          where: { phone: customerPhone }
        });

        if (existingCustomer) {
          finalCustomerId = existingCustomer.id;
        } else {
          const newCustomer = await tx.customer.create({
            data: {
              name: customerName,
              phone: customerPhone,
              totalSpent: 0,
              loyaltyPoints: 0
            }
          });
          finalCustomerId = newCustomer.id;
        }
      }

      const newOrder = await tx.order.create({
        data: {
          customId: `ORD-${Date.now()}`,
          customerId: finalCustomerId,
          customerName,
          customerPhone,
          subtotal,
          gst,
          discount,
          total,
          paymentMethod,
          dueDate: dueDate ? new Date(dueDate) : null,
          paymentStatus: payStatus,
          status: 'pending',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              qty: item.qty,
              gstRate: item.gstRate || 0
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
      if (finalCustomerId) {
        await tx.customer.update({
          where: { id: finalCustomerId },
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

app.patch('/api/orders/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch order first to get details for stock restoration and customer update
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } }
        });
      }

      // 2. Adjust customer total spent and loyalty points
      if (order.customerId) {
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            totalSpent: { decrement: order.total },
            loyaltyPoints: { decrement: Math.floor(order.total / 100) }
          }
        });
      }

      // 3. Delete Invoice
      await tx.invoice.deleteMany({ where: { orderId: id } });

      // 4. Delete OrderItems
      await tx.orderItem.deleteMany({ where: { orderId: id } });

      // 5. Delete Order
      await tx.order.delete({ where: { id } });
    }, {
      timeout: 30000 // 30 seconds timeout
    });

    res.status(204).send();
  } catch (error) {
    console.error("DELETE Order Error:", error);
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

    const todayRevenue = todayOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
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
