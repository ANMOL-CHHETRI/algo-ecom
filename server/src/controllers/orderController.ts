import { Request, Response } from 'express';
import { prisma } from '../config/db';

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BW-${year}-${random}`;
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      deliveryAddress,
      deliveryPhone,
      paymentMethod = 'COD',
      roadNodeId,
      latitude,
      longitude,
    } = req.body;

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart is empty' });
      return;
    }

    // Atomic transaction for checking stock and creating order
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify stock for all items
      for (const item of cart.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product?.name || item.productId}`);
        }
      }

      const totalAmount = cart.items.reduce(
        (sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity,
        0
      );

      // Base delivery is Rs. 50; Cash on Delivery (COD) incurs an extra Rs. 10 handling charge (Rs. 60 total)
      const deliveryCharge = paymentMethod === 'COD' ? 60 : 50;

      // 2. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: req.user!.id,
          totalAmount,
          deliveryCharge,
          paymentMethod: paymentMethod as any,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          orderStatus: 'PLACED',
          deliveryAddress,
          deliveryPhone,
          roadNodeId: roadNodeId || null,
          latitude: latitude || null,
          longitude: longitude || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.discountPrice ?? item.product.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          roadNode: true,
        },
      });

      // 3. Decrement stock and log inventory transactions
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            changeAmount: -item.quantity,
            type: 'SALE',
            referenceOrderId: newOrder.id,
          },
        });
      }

      // 4. Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json({ success: true, order });
  } catch (err: any) {
    res
      .status(err.message.includes('Insufficient stock') ? 400 : 500)
      .json({ success: false, message: err.message });
  }
};

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'ADMIN';
    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { customerId: req.user!.id },
      include: {
        items: { include: { product: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        roadNode: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: { include: { category: true } } } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        roadNode: true,
        delivery: {
          include: {
            courier: { select: { name: true, phone: true } },
            batch: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && order.customerId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData: any = {};
    if (status) updateData.orderStatus = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
