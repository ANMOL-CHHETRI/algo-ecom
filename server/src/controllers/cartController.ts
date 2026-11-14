import { Request, Response } from 'express';
import { prisma } from '../config/db';

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { category: true } } },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: { include: { category: true } } },
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  return cart;
}

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const cart = await getOrCreateCart(req.user!.id);
    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;
    const cart = await getOrCreateCart(req.user!.id);

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await getOrCreateCart(req.user!.id);
    res.json({ success: true, cart: updatedCart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: req.params.itemId },
        data: { quantity },
      });
    }
    const cart = await getOrCreateCart(req.user!.id);
    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    const cart = await getOrCreateCart(req.user!.id);
    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
