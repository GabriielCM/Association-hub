import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartService } from '../services/cart.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('CartService', () => {
  let service: CartService;
  let prisma: any;

  const mockProduct = {
    id: 'prod-1',
    name: 'Produto Teste',
    slug: 'produto-teste',
    pricePoints: 100,
    priceMoney: new Decimal(10.0),
    isActive: true,
    stockType: 'limited',
    stockCount: 50,
    images: [{ url: 'https://example.com/img.jpg' }],
  };

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    subtotalPoints: 200,
    subtotalMoney: new Decimal(20.0),
    reservedUntil: null,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        variantId: null,
        quantity: 2,
        unitPricePoints: 100,
        unitPriceMoney: new Decimal(10.0),
        product: mockProduct,
        variant: null,
      },
    ],
  };

  beforeEach(() => {
    prisma = {
      cart: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      cartItem: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
      storeProduct: {
        findUnique: vi.fn(),
      },
      productVariant: {
        findUnique: vi.fn(),
      },
    };

    service = new CartService(prisma);
  });

  // ===========================================
  // getOrCreateCart
  // ===========================================

  describe('getOrCreateCart', () => {
    it('should return existing cart', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);

      const result = await service.getOrCreateCart('user-1');

      expect(result.id).toBe('cart-1');
      expect(result.items).toHaveLength(1);
      expect(result.subtotalPoints).toBe(200);
    });

    it('should create cart when none exists', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);
      prisma.cart.create.mockResolvedValue({
        id: 'cart-new',
        userId: 'user-1',
        subtotalPoints: 0,
        subtotalMoney: new Decimal(0),
        items: [],
      });

      const result = await service.getOrCreateCart('user-1');

      expect(result.id).toBe('cart-new');
      expect(result.items).toHaveLength(0);
      expect(result.subtotalPoints).toBe(0);
    });
  });

  // ===========================================
  // addItem
  // ===========================================

  describe('addItem', () => {
    const addDto = { productId: 'prod-1', quantity: 1 };

    it('should add item to cart', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.cart.findUnique
        .mockResolvedValueOnce(null) // First call - get cart
        .mockResolvedValueOnce(mockCart); // Second call - getOrCreateCart return
      prisma.cart.create.mockResolvedValue({ id: 'cart-new', userId: 'user-1' });
      prisma.cartItem.findFirst.mockResolvedValue(null); // Limit check
      prisma.cartItem.findUnique.mockResolvedValue(null); // Upsert check
      prisma.cartItem.create.mockResolvedValue({
        id: 'item-1',
        productId: 'prod-1',
        quantity: 1,
      });
      prisma.cartItem.findMany.mockResolvedValue([]);
      prisma.cart.update.mockResolvedValue({ ...mockCart, items: [] });

      const result = await service.addItem('user-1', addDto);

      expect(prisma.cartItem.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
      prisma.storeProduct.findUnique.mockResolvedValue(null);

      await expect(service.addItem('user-1', addDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when product is inactive', async () => {
      prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
      prisma.storeProduct.findUnique.mockResolvedValue({ ...mockProduct, isActive: false });

      await expect(service.addItem('user-1', addDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
      prisma.storeProduct.findUnique.mockResolvedValue({ ...mockProduct, stockCount: 0 });

      await expect(service.addItem('user-1', addDto)).rejects.toThrow(BadRequestException);
    });

    it('should update quantity if item already exists', async () => {
      prisma.storeProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(null); // Limit check
      prisma.cartItem.findUnique.mockResolvedValue({
        id: 'item-1',
        productId: 'prod-1',
        quantity: 2,
      });
      prisma.cartItem.update.mockResolvedValue({
        id: 'item-1',
        quantity: 3,
      });
      prisma.cartItem.findMany.mockResolvedValue([]);

      await service.addItem('user-1', addDto);

      expect(prisma.cartItem.update).toHaveBeenCalled();
    });

    it('should add item with variant', async () => {
      const variantDto = { productId: 'prod-1', variantId: 'var-1', quantity: 1 };
      const mockVariant = {
        id: 'var-1',
        productId: 'prod-1',
        pricePoints: 120,
        priceMoney: new Decimal(12.0),
        stockCount: 30,
        isActive: true,
      };
      const productWithVariant = {
        ...mockProduct,
        variants: [mockVariant],
      };

      prisma.storeProduct.findUnique.mockResolvedValue(productWithVariant);
      prisma.cart.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCart);
      prisma.cart.create.mockResolvedValue({ id: 'cart-new', userId: 'user-1' });
      prisma.cartItem.findFirst.mockResolvedValue(null);
      prisma.cartItem.findUnique.mockResolvedValue(null);
      prisma.cartItem.create.mockResolvedValue({ id: 'item-1' });
      prisma.cartItem.findMany.mockResolvedValue([]);
      prisma.cart.update.mockResolvedValue(mockCart);

      await service.addItem('user-1', variantDto);

      expect(prisma.cartItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            variantId: 'var-1',
            unitPricePoints: 120,
          }),
        }),
      );
    });
  });

  // ===========================================
  // updateItem
  // ===========================================

  describe('updateItem', () => {
    it('should update item quantity', async () => {
      const mockItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 2,
        product: mockProduct,
        variant: null,
      };
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(mockItem);
      prisma.cartItem.update.mockResolvedValue({ ...mockItem, quantity: 5 });
      prisma.cartItem.findMany.mockResolvedValue([]);
      prisma.cart.update.mockResolvedValue(mockCart);

      const result = await service.updateItem('user-1', 'item-1', { quantity: 5 });

      expect(prisma.cartItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { quantity: 5 },
        }),
      );
    });

    it('should throw NotFoundException when item not found', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(service.updateItem('user-1', 'invalid', { quantity: 5 })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const mockItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'prod-1',
        quantity: 2,
        product: { ...mockProduct, stockCount: 3 },
        variant: null,
      };
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(mockItem);

      await expect(service.updateItem('user-1', 'item-1', { quantity: 100 })).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // removeItem
  // ===========================================

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const mockItem = { id: 'item-1', cartId: 'cart-1' };
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(mockItem);
      prisma.cartItem.delete.mockResolvedValue(mockItem);
      prisma.cartItem.findMany.mockResolvedValue([]);
      prisma.cart.update.mockResolvedValue({ ...mockCart, items: [] });

      const result = await service.removeItem('user-1', 'item-1');

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 'item-1' },
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.findFirst.mockResolvedValue(null);

      await expect(service.removeItem('user-1', 'invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // clearCart
  // ===========================================

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });
      prisma.cart.update.mockResolvedValue({
        ...mockCart,
        subtotalPoints: 0,
        subtotalMoney: new Decimal(0),
      });

      const result = await service.clearCart('user-1');

      expect(result.success).toBe(true);
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
      });
    });

    it('should return success when cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      const result = await service.clearCart('user-1');

      expect(result.success).toBe(true);
    });
  });

  // ===========================================
  // reserveStock
  // ===========================================

  describe('reserveStock', () => {
    it('should reserve stock for checkout', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cart.update.mockResolvedValue({
        ...mockCart,
        reservedUntil: new Date(Date.now() + 30 * 60 * 1000),
      });
      prisma.cartItem.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.reserveStock('user-1');

      expect(result.reservedUntil).toBeDefined();
      expect(prisma.cartItem.updateMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
        data: { reservedStock: true },
      });
    });

    it('should throw BadRequestException when cart is empty', async () => {
      prisma.cart.findUnique.mockResolvedValue({ ...mockCart, items: [] });

      await expect(service.reserveStock('user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      const cartWithLowStock = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 100,
            product: { ...mockProduct, stockCount: 5 },
          },
        ],
      };
      prisma.cart.findUnique.mockResolvedValue(cartWithLowStock);

      await expect(service.reserveStock('user-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ===========================================
  // releaseReservation
  // ===========================================

  describe('releaseReservation', () => {
    it('should release stock reservation', async () => {
      prisma.cart.findUnique.mockResolvedValue(mockCart);
      prisma.cart.update.mockResolvedValue({ ...mockCart, reservedUntil: null });
      prisma.cartItem.updateMany.mockResolvedValue({ count: 1 });

      await service.releaseReservation('user-1');

      expect(prisma.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart-1' },
        data: { reservedUntil: null },
      });
      expect(prisma.cartItem.updateMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
        data: { reservedStock: false },
      });
    });

    it('should do nothing when cart does not exist', async () => {
      prisma.cart.findUnique.mockResolvedValue(null);

      await service.releaseReservation('user-1');

      expect(prisma.cart.update).not.toHaveBeenCalled();
    });
  });
});
