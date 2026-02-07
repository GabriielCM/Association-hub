import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BenefitsController, AdminPartnersController } from '../partners.controller';
import { PartnersService } from '../partners.service';
import { JwtPayload } from '../../../common/types';

// ===========================================
// BenefitsController
// ===========================================

describe('BenefitsController', () => {
  let controller: BenefitsController;
  let service: PartnersService;

  const mockUser: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    associationId: 'assoc-1',
  };

  const mockBenefitsList = {
    data: [
      {
        id: 'partner-1',
        name: 'Pizzaria Bella',
        logoUrl: 'https://example.com/logo.png',
        benefit: '15% de desconto',
        category: { id: 'cat-1', name: 'Alimentação', slug: 'food' },
        isEligible: true,
        isNew: true,
      },
      {
        id: 'partner-2',
        name: 'Academia Fit',
        logoUrl: 'https://example.com/gym.png',
        benefit: '20% de desconto',
        category: { id: 'cat-2', name: 'Saúde', slug: 'health' },
        isEligible: false,
        isNew: false,
      },
    ],
    meta: {
      total: 2,
      page: 1,
      perPage: 20,
      totalPages: 1,
    },
  };

  const mockCategories = {
    data: [
      { id: 'cat-1', name: 'Alimentação', slug: 'food', icon: 'utensils', color: '#FF5722', partnerCount: 5 },
      { id: 'cat-2', name: 'Saúde', slug: 'health', icon: 'heart', color: '#4CAF50', partnerCount: 3 },
    ],
  };

  const mockNearbyPartners = {
    data: [
      {
        id: 'partner-1',
        name: 'Pizzaria Bella',
        benefit: '15% de desconto',
        distance: 0.5,
        lat: -23.5505,
        lng: -46.6333,
        isEligible: true,
      },
    ],
    message: null,
  };

  const mockPartnerDetails = {
    id: 'partner-1',
    name: 'Pizzaria Bella',
    logoUrl: 'https://example.com/logo.png',
    bannerUrl: 'https://example.com/banner.png',
    benefit: '15% de desconto',
    instructions: 'Apresente a carteirinha',
    category: { id: 'cat-1', name: 'Alimentação', slug: 'food' },
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    contact: {
      phone: '11999999999',
      website: 'https://pizzariabella.com',
      instagram: '@pizzariabella',
      whatsapp: '11999999999',
    },
    businessHours: {
      monday: '11:00-23:00',
      tuesday: '11:00-23:00',
    },
    isOpenNow: true,
    isEligible: true,
  };

  beforeEach(() => {
    service = {
      listBenefits: vi.fn().mockResolvedValue(mockBenefitsList),
      listCategories: vi.fn().mockResolvedValue(mockCategories),
      getNearbyPartners: vi.fn().mockResolvedValue(mockNearbyPartners),
      getPartnerDetails: vi.fn().mockResolvedValue(mockPartnerDetails),
    } as unknown as PartnersService;

    controller = new BenefitsController(service);
  });

  // ===========================================
  // listBenefits
  // ===========================================

  describe('listBenefits', () => {
    it('should return paginated list of benefits', async () => {
      const query = { page: 1, perPage: 20 };

      const result = await controller.listBenefits(mockUser, query);

      expect(result).toEqual({ success: true, data: mockBenefitsList });
      expect(service.listBenefits).toHaveBeenCalledWith('assoc-1', 'user-123', query);
    });

    it('should pass associationId and userId from JWT', async () => {
      const query = { page: 1, perPage: 10 };

      await controller.listBenefits(mockUser, query);

      expect(service.listBenefits).toHaveBeenCalledWith('assoc-1', 'user-123', query);
    });

    it('should pass category and search filters to service', async () => {
      const query = { page: 1, perPage: 10, categoryId: 'cat-1', search: 'Pizza' };

      await controller.listBenefits(mockUser, query);

      expect(service.listBenefits).toHaveBeenCalledWith('assoc-1', 'user-123', query);
    });
  });

  // ===========================================
  // listCategories
  // ===========================================

  describe('listCategories', () => {
    it('should return categories from service', async () => {
      const result = await controller.listCategories(mockUser);

      expect(result).toEqual({ success: true, data: mockCategories });
      expect(service.listCategories).toHaveBeenCalledWith('assoc-1');
    });
  });

  // ===========================================
  // getNearbyPartners
  // ===========================================

  describe('getNearbyPartners', () => {
    it('should return nearby partners', async () => {
      const query = { lat: -23.55, lng: -46.63, radius: 10, limit: 20 };

      const result = await controller.getNearbyPartners(mockUser, query);

      expect(result).toEqual({ success: true, data: mockNearbyPartners });
      expect(service.getNearbyPartners).toHaveBeenCalledWith('assoc-1', 'user-123', query);
    });

    it('should handle missing location gracefully', async () => {
      service.getNearbyPartners = vi.fn().mockResolvedValue({
        data: [],
        message: 'Localização não fornecida',
      });

      const query = { lat: undefined as any, lng: undefined as any, radius: 10, limit: 20 };

      const result = await controller.getNearbyPartners(mockUser, query);

      expect(result.data.data).toHaveLength(0);
      expect(result.data.message).toBe('Localização não fornecida');
    });
  });

  // ===========================================
  // getPartnerDetails
  // ===========================================

  describe('getPartnerDetails', () => {
    it('should return partner details wrapped in data object', async () => {
      const result = await controller.getPartnerDetails('partner-1', mockUser);

      expect(result).toEqual({ success: true, data: mockPartnerDetails });
      expect(service.getPartnerDetails).toHaveBeenCalledWith('partner-1', 'user-123');
    });

    it('should propagate NotFoundException for invalid partner', async () => {
      service.getPartnerDetails = vi.fn().mockRejectedValue(
        new NotFoundException('Parceiro não encontrado'),
      );

      await expect(controller.getPartnerDetails('invalid-partner', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

// ===========================================
// AdminPartnersController
// ===========================================

describe('AdminPartnersController', () => {
  let controller: AdminPartnersController;
  let service: PartnersService;

  const mockAdminUser: JwtPayload = {
    sub: 'admin-123',
    email: 'admin@example.com',
    role: 'ADMIN',
    associationId: 'assoc-1',
  };

  const mockCreatedPartner = {
    id: 'partner-new',
    name: 'Novo Parceiro',
    benefit: '10% de desconto',
    categoryId: 'cat-1',
    isActive: true,
    createdAt: new Date(),
  };

  const mockUpdatedPartner = {
    id: 'partner-1',
    name: 'Parceiro Atualizado',
    benefit: '20% de desconto',
    updatedAt: new Date(),
  };

  const mockCreatedCategory = {
    id: 'cat-new',
    name: 'Nova Categoria',
    slug: 'new-category',
    icon: 'star',
    color: '#FF0000',
    order: 0,
    isActive: true,
  };

  const mockUpdatedCategory = {
    id: 'cat-1',
    name: 'Categoria Atualizada',
    icon: 'edit',
    updatedAt: new Date(),
  };

  beforeEach(() => {
    service = {
      createPartner: vi.fn().mockResolvedValue(mockCreatedPartner),
      updatePartner: vi.fn().mockResolvedValue(mockUpdatedPartner),
      deletePartner: vi.fn().mockResolvedValue(undefined),
      createCategory: vi.fn().mockResolvedValue(mockCreatedCategory),
      updateCategory: vi.fn().mockResolvedValue(mockUpdatedCategory),
    } as unknown as PartnersService;

    controller = new AdminPartnersController(service);
  });

  // ===========================================
  // createPartner
  // ===========================================

  describe('createPartner', () => {
    it('should create partner and return success with data', async () => {
      const dto = {
        name: 'Novo Parceiro',
        benefit: '10% de desconto',
        categoryId: 'cat-1',
      };

      const result = await controller.createPartner(mockAdminUser, dto as any);

      expect(result).toEqual({ success: true, data: mockCreatedPartner });
      expect(service.createPartner).toHaveBeenCalledWith('assoc-1', dto);
    });

    it('should pass all DTO fields to service', async () => {
      const dto = {
        name: 'Parceiro Completo',
        benefit: '15% de desconto',
        categoryId: 'cat-1',
        instructions: 'Apresente a carteirinha',
        phone: '11999999999',
        website: 'https://parceiro.com',
      };

      await controller.createPartner(mockAdminUser, dto as any);

      expect(service.createPartner).toHaveBeenCalledWith('assoc-1', dto);
    });

    it('should propagate NotFoundException for invalid category', async () => {
      service.createPartner = vi.fn().mockRejectedValue(
        new NotFoundException('Categoria não encontrada'),
      );

      const dto = { name: 'Parceiro', benefit: 'Desconto', categoryId: 'invalid-cat' };

      await expect(controller.createPartner(mockAdminUser, dto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ===========================================
  // updatePartner
  // ===========================================

  describe('updatePartner', () => {
    it('should update partner and return success with data', async () => {
      const dto = { categoryId: 'cat-1', name: 'Parceiro Atualizado', benefit: '20% de desconto' };

      const result = await controller.updatePartner('partner-1', mockAdminUser, dto);

      expect(result).toEqual({ success: true, data: mockUpdatedPartner });
      expect(service.updatePartner).toHaveBeenCalledWith('partner-1', 'assoc-1', dto);
    });

    it('should propagate NotFoundException for non-existent partner', async () => {
      service.updatePartner = vi.fn().mockRejectedValue(
        new NotFoundException('Parceiro não encontrado'),
      );

      const dto = { categoryId: 'cat-1', name: 'Update', benefit: '10% desconto' };

      await expect(controller.updatePartner('invalid-partner', mockAdminUser, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ===========================================
  // deletePartner
  // ===========================================

  describe('deletePartner', () => {
    it('should delete partner and return success message', async () => {
      const result = await controller.deletePartner('partner-1', mockAdminUser);

      expect(result).toEqual({ success: true, message: 'Parceiro desativado com sucesso' });
      expect(service.deletePartner).toHaveBeenCalledWith('partner-1', 'assoc-1');
    });

    it('should propagate NotFoundException for non-existent partner', async () => {
      service.deletePartner = vi.fn().mockRejectedValue(
        new NotFoundException('Parceiro não encontrado'),
      );

      await expect(controller.deletePartner('invalid-partner', mockAdminUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ===========================================
  // createCategory
  // ===========================================

  describe('createCategory', () => {
    it('should create category and return success with data', async () => {
      const dto = { name: 'Nova Categoria', slug: 'new-category' };

      const result = await controller.createCategory(mockAdminUser, dto as any);

      expect(result).toEqual({ success: true, data: mockCreatedCategory });
      expect(service.createCategory).toHaveBeenCalledWith('assoc-1', dto);
    });

    it('should propagate ConflictException for duplicate slug', async () => {
      service.createCategory = vi.fn().mockRejectedValue(
        new ConflictException('Slug já existe nesta associação'),
      );

      const dto = { name: 'Categoria', slug: 'existing-slug' };

      await expect(controller.createCategory(mockAdminUser, dto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ===========================================
  // updateCategory
  // ===========================================

  describe('updateCategory', () => {
    it('should update category and return success with data', async () => {
      const dto = { name: 'Categoria Atualizada', icon: 'edit' };

      const result = await controller.updateCategory('cat-1', mockAdminUser, dto);

      expect(result).toEqual({ success: true, data: mockUpdatedCategory });
      expect(service.updateCategory).toHaveBeenCalledWith('cat-1', 'assoc-1', dto);
    });

    it('should propagate NotFoundException for non-existent category', async () => {
      service.updateCategory = vi.fn().mockRejectedValue(
        new NotFoundException('Categoria não encontrada'),
      );

      const dto = { name: 'Update' };

      await expect(controller.updateCategory('invalid-cat', mockAdminUser, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
