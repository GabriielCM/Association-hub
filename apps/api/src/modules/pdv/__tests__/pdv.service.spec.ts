import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PdvService } from '../pdv.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('PdvService', () => {
  let service: PdvService;
  let prisma: any;
  let notificationsService: any;

  const mockPdv = {
    id: 'pdv-1',
    associationId: 'assoc-1',
    name: 'PDV Central',
    location: 'Entrada Principal',
    apiKey: 'pdv_api_key_test',
    apiSecret: 'hashed_secret',
    status: 'ACTIVE',
    products: [],
    _count: { products: 5, sales: 10 },
  };

  const mockProduct = {
    id: 'pdvprod-1',
    pdvId: 'pdv-1',
    name: 'Café',
    pricePoints: 50,
    priceMoney: new Decimal(5.0),
    stock: 100,
    isActive: true,
  };

  beforeEach(() => {
    prisma = {
      pdv: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      pdvProduct: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      pdvSale: {
        findMany: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    };

    notificationsService = {
      createBatch: vi.fn(),
    };

    const pdvGateway = {
      broadcastCatalogUpdated: vi.fn(),
    };

    service = new PdvService(prisma, notificationsService, pdvGateway as any);
  });

  // ===========================================
  // createPdv
  // ===========================================

  describe('createPdv', () => {
    const createDto = {
      name: 'Novo PDV',
      location: 'Nova Localização',
    };

    it('should create a new PDV with API credentials', async () => {
      prisma.pdv.create.mockResolvedValue({
        id: 'pdv-new',
        associationId: 'assoc-1',
        ...createDto,
        apiKey: 'pdv_generated_key',
        apiSecret: 'hashed_secret',
        status: 'ACTIVE',
      });

      const result = await service.createPdv('assoc-1', createDto);

      expect(result.id).toBe('pdv-new');
      expect(result.apiSecret).toBeDefined();
      expect(prisma.pdv.create).toHaveBeenCalled();
    });
  });

  // ===========================================
  // getPdvs
  // ===========================================

  describe('getPdvs', () => {
    it('should return all PDVs for an association', async () => {
      prisma.pdv.findMany.mockResolvedValue([mockPdv]);

      const result = await service.getPdvs('assoc-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('PDV Central');
      expect(prisma.pdv.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { associationId: 'assoc-1' },
        }),
      );
    });
  });

  // ===========================================
  // getPdvById
  // ===========================================

  describe('getPdvById', () => {
    it('should return PDV by id', async () => {
      prisma.pdv.findUnique.mockResolvedValue(mockPdv);

      const result = await service.getPdvById('pdv-1');

      expect(result.id).toBe('pdv-1');
    });

    it('should throw NotFoundException when PDV not found', async () => {
      prisma.pdv.findUnique.mockResolvedValue(null);

      await expect(service.getPdvById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // updatePdv
  // ===========================================

  describe('updatePdv', () => {
    it('should update PDV', async () => {
      prisma.pdv.findUnique.mockResolvedValue(mockPdv);
      prisma.pdv.update.mockResolvedValue({ ...mockPdv, name: 'PDV Atualizado' });

      const result = await service.updatePdv('pdv-1', { name: 'PDV Atualizado' });

      expect(result.name).toBe('PDV Atualizado');
    });

    it('should throw NotFoundException when PDV not found', async () => {
      prisma.pdv.findUnique.mockResolvedValue(null);

      await expect(service.updatePdv('invalid', { name: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should update status to MAINTENANCE', async () => {
      prisma.pdv.findUnique.mockResolvedValue(mockPdv);
      prisma.pdv.update.mockResolvedValue({ ...mockPdv, status: 'MAINTENANCE' });

      const result = await service.updatePdv('pdv-1', { status: 'MAINTENANCE' as any });

      expect(result.status).toBe('MAINTENANCE');
    });
  });

  // ===========================================
  // deletePdv
  // ===========================================

  describe('deletePdv', () => {
    it('should deactivate PDV', async () => {
      prisma.pdv.findUnique.mockResolvedValue(mockPdv);
      prisma.pdv.update.mockResolvedValue({ ...mockPdv, status: 'INACTIVE' });

      const result = await service.deletePdv('pdv-1');

      expect(result.status).toBe('INACTIVE');
      expect(prisma.pdv.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'INACTIVE' },
        }),
      );
    });

    it('should throw NotFoundException when PDV not found', async () => {
      prisma.pdv.findUnique.mockResolvedValue(null);

      await expect(service.deletePdv('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // regenerateApiCredentials
  // ===========================================

  describe('regenerateApiCredentials', () => {
    it('should regenerate API credentials', async () => {
      prisma.pdv.findUnique.mockResolvedValue(mockPdv);
      prisma.pdv.update.mockResolvedValue({
        ...mockPdv,
        apiKey: 'pdv_new_key',
        apiSecret: 'new_hashed_secret',
      });

      const result = await service.regenerateApiCredentials('pdv-1');

      expect(result.apiKey).toBeDefined();
      expect(result.apiSecret).toBeDefined();
    });

    it('should throw NotFoundException when PDV not found', async () => {
      prisma.pdv.findUnique.mockResolvedValue(null);

      await expect(service.regenerateApiCredentials('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // addProduct
  // ===========================================

  describe('addProduct', () => {
    const productDto = {
      name: 'Novo Produto',
      pricePoints: 100,
      priceMoney: 10.0,
      stock: 50,
    };

    it('should add product to PDV', async () => {
      prisma.pdv.findUnique.mockResolvedValue(mockPdv);
      prisma.pdvProduct.create.mockResolvedValue({
        id: 'pdvprod-new',
        pdvId: 'pdv-1',
        ...productDto,
        priceMoney: new Decimal(productDto.priceMoney),
      });

      const result = await service.addProduct('pdv-1', productDto);

      expect(result.name).toBe('Novo Produto');
    });

    it('should throw NotFoundException when PDV not found', async () => {
      prisma.pdv.findUnique.mockResolvedValue(null);

      await expect(service.addProduct('invalid', productDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // getProducts
  // ===========================================

  describe('getProducts', () => {
    it('should return active products for a PDV', async () => {
      prisma.pdvProduct.findMany.mockResolvedValue([mockProduct]);

      const result = await service.getProducts('pdv-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Café');
    });

    it('should filter by active status by default', async () => {
      prisma.pdvProduct.findMany.mockResolvedValue([mockProduct]);

      await service.getProducts('pdv-1');

      expect(prisma.pdvProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ pdvId: 'pdv-1', isActive: true }),
        }),
      );
    });

    it('should include inactive products when flag is set', async () => {
      prisma.pdvProduct.findMany.mockResolvedValue([mockProduct]);

      await service.getProducts('pdv-1', true);

      expect(prisma.pdvProduct.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { pdvId: 'pdv-1' },
        }),
      );
    });
  });

  // ===========================================
  // updateProduct
  // ===========================================

  describe('updateProduct', () => {
    it('should update product', async () => {
      prisma.pdvProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.pdvProduct.update.mockResolvedValue({ ...mockProduct, name: 'Café Premium' });

      const result = await service.updateProduct('pdvprod-1', { name: 'Café Premium' });

      expect(result.name).toBe('Café Premium');
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.pdvProduct.findUnique.mockResolvedValue(null);

      await expect(service.updateProduct('invalid', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ===========================================
  // deleteProduct
  // ===========================================

  describe('deleteProduct', () => {
    it('should deactivate product', async () => {
      prisma.pdvProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.pdvProduct.update.mockResolvedValue({ ...mockProduct, isActive: false });

      const result = await service.deleteProduct('pdvprod-1');

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.pdvProduct.findUnique.mockResolvedValue(null);

      await expect(service.deleteProduct('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // updateStock
  // ===========================================

  describe('updateStock', () => {
    it('should update product stock', async () => {
      prisma.pdvProduct.findUnique.mockResolvedValue(mockProduct);
      prisma.pdvProduct.update.mockResolvedValue({ ...mockProduct, stock: 150 });

      const result = await service.updateStock({ productId: 'pdvprod-1', quantity: 50 });

      expect(result.stock).toBe(150);
    });

    it('should throw BadRequestException when stock would be negative', async () => {
      prisma.pdvProduct.findUnique.mockResolvedValue({ ...mockProduct, stock: 10 });

      await expect(
        service.updateStock({ productId: 'pdvprod-1', quantity: -20 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.pdvProduct.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStock({ productId: 'invalid', quantity: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ===========================================
  // getStock
  // ===========================================

  describe('getStock', () => {
    it('should return stock for all active products', async () => {
      prisma.pdvProduct.findMany.mockResolvedValue([
        { id: 'pdvprod-1', name: 'Café', stock: 100, pricePoints: 50, priceMoney: new Decimal(5) },
      ]);

      const result = await service.getStock('pdv-1');

      expect(result).toHaveLength(1);
      expect(result[0].stock).toBe(100);
    });
  });

  // ===========================================
  // getSalesReport
  // ===========================================

  describe('getSalesReport', () => {
    it('should return sales report', async () => {
      prisma.pdvSale.findMany.mockResolvedValue([
        {
          id: 'sale-1',
          totalPoints: 100,
          totalMoney: new Decimal(10.0),
          paymentMethod: 'POINTS',
          cashbackEarned: 5,
          createdAt: new Date(),
        },
        {
          id: 'sale-2',
          totalPoints: 0,
          totalMoney: new Decimal(20.0),
          paymentMethod: 'PIX',
          cashbackEarned: 10,
          createdAt: new Date(),
        },
      ]);

      const result = await service.getSalesReport('pdv-1');

      expect(result.totalSales).toBe(2);
      expect(result.totalPoints).toBe(100);
      expect(result.totalMoney).toBe(20);
      expect(result.cashbackTotal).toBe(15);
      expect(result.salesByMethod.POINTS).toBe(1);
      expect(result.salesByMethod.PIX).toBe(1);
    });

    it('should filter by date range', async () => {
      prisma.pdvSale.findMany.mockResolvedValue([]);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      await service.getSalesReport('pdv-1', startDate, endDate);

      expect(prisma.pdvSale.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            pdvId: 'pdv-1',
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        }),
      );
    });

    it('should return empty report when no sales', async () => {
      prisma.pdvSale.findMany.mockResolvedValue([]);

      const result = await service.getSalesReport('pdv-1');

      expect(result.totalSales).toBe(0);
      expect(result.totalPoints).toBe(0);
      expect(result.totalMoney).toBe(0);
    });
  });
});
