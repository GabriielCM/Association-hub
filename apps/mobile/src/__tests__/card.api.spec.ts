import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the API client typed helpers
vi.mock('@/services/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));

import { get } from '@/services/api/client';
import {
  getCard,
  getCardStatus,
  getQrCode,
  getCardHistory,
} from '@/features/card/api/card.api';
import {
  listBenefits,
  listCategories,
  getPartnerDetails,
} from '@/features/card/api/benefits.api';
import type {
  MemberCard,
  CardQrCode,
  CardHistoryResponse,
  BenefitsListResponse,
  PartnerCategory,
  PartnerDetail,
} from '@ahub/shared/types';

const mockCard: MemberCard = {
  id: 'card-1',
  cardNumber: 'AHUB-00001',
  status: 'ACTIVE',
  issuedAt: new Date('2025-01-01'),
  user: {
    id: 'user-1',
    name: 'João Silva',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  association: {
    id: 'assoc-1',
    name: 'Associação Teste',
    logoUrl: 'https://example.com/logo.png',
    phone: '11999999999',
    email: 'contato@assoc.com',
  },
};

const mockQrCode: CardQrCode = {
  qrCodeData: 'AHUB-CARD-TOKEN-ABC123',
  qrCodeHash: 'sha256-hash-value',
  cardNumber: 'AHUB-00001',
};

const mockHistoryResponse: CardHistoryResponse = {
  data: [
    {
      id: 'log-1',
      type: 'CHECKIN',
      location: 'Sede da Associação',
      scannedAt: new Date(),
    },
    {
      id: 'log-2',
      type: 'BENEFIT_USED',
      partner: { id: 'p1', name: 'Parceiro A', logoUrl: 'https://example.com/p.png' },
      scannedAt: new Date(),
    },
  ],
  meta: { currentPage: 1, perPage: 20, totalCount: 2, totalPages: 1 },
};

const mockBenefitsResponse: BenefitsListResponse = {
  data: [
    {
      id: 'partner-1',
      name: 'Restaurante Bom',
      logoUrl: 'https://example.com/rest.png',
      benefit: '10% de desconto',
      category: { id: 'cat-1', name: 'Gastronomia', slug: 'gastronomia', icon: '🍕', color: '#FF6B00' },
      isNew: true,
      isEligible: true,
    },
  ],
  meta: { currentPage: 1, perPage: 20, totalCount: 1, totalPages: 1 },
};

const mockCategories: PartnerCategory[] = [
  { id: 'cat-1', name: 'Gastronomia', slug: 'gastronomia', icon: '🍕', color: '#FF6B6B', partnersCount: 5 },
  { id: 'cat-2', name: 'Saúde', slug: 'saude', icon: '💊', color: '#4ECDC4', partnersCount: 3 },
];

const mockPartnerDetail: PartnerDetail = {
  id: 'partner-1',
  name: 'Restaurante Bom',
  logoUrl: 'https://example.com/rest.png',
  benefit: '10% de desconto',
  instructions: 'Apresente a carteirinha',
  category: { id: 'cat-1', name: 'Gastronomia', slug: 'gastronomia', icon: '🍕', color: '#FF6B6B' },
  isNew: true,
  isEligible: true,
  contact: {
    phone: '11999999999',
    website: 'https://restaurantebom.com',
    instagram: 'restaurantebom',
    whatsapp: '5511999999999',
  },
  address: {
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    lat: -23.5505,
    lng: -46.6333,
  },
  businessHours: {
    segunda: '11:00 - 22:00',
    terça: '11:00 - 22:00',
    quarta: '11:00 - 22:00',
  },
  isOpenNow: true,
};

describe('Card API (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCard', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockCard);
      const result = await getCard();
      expect(get).toHaveBeenCalledWith('/user/card');
      expect(result).toEqual(mockCard);
    });
  });

  describe('getCardStatus', () => {
    it('should call get with correct URL', async () => {
      const mockStatus = { status: 'ACTIVE' as const };
      vi.mocked(get).mockResolvedValueOnce(mockStatus);
      const result = await getCardStatus();
      expect(get).toHaveBeenCalledWith('/user/card/status');
      expect(result.status).toBe('ACTIVE');
    });

    it('should return status with reason when suspended', async () => {
      const mockStatus = { status: 'SUSPENDED' as const, statusReason: 'Pagamento pendente' };
      vi.mocked(get).mockResolvedValueOnce(mockStatus);
      const result = await getCardStatus();
      expect(result.status).toBe('SUSPENDED');
      expect(result.statusReason).toBe('Pagamento pendente');
    });
  });

  describe('getQrCode', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockQrCode);
      const result = await getQrCode();
      expect(get).toHaveBeenCalledWith('/user/card/qrcode');
      expect(result).toEqual(mockQrCode);
    });
  });

  describe('getCardHistory', () => {
    it('should call get with correct URL and no params', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockHistoryResponse);
      const result = await getCardHistory();
      expect(get).toHaveBeenCalledWith('/user/card/history', undefined);
      expect(result.data).toHaveLength(2);
    });

    it('should pass query params', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockHistoryResponse);
      await getCardHistory({ page: 2, perPage: 10, type: 'CHECKIN' });
      expect(get).toHaveBeenCalledWith('/user/card/history', {
        page: 2,
        perPage: 10,
        type: 'CHECKIN',
      });
    });
  });
});

describe('Benefits API (Mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listBenefits', () => {
    it('should call get with correct URL and no filters', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockBenefitsResponse);
      const result = await listBenefits();
      expect(get).toHaveBeenCalledWith('/benefits', undefined);
      expect(result.data).toHaveLength(1);
    });

    it('should pass filters', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockBenefitsResponse);
      await listBenefits({ search: 'restaurante', category: 'cat-1', page: 1, perPage: 20 });
      expect(get).toHaveBeenCalledWith('/benefits', {
        search: 'restaurante',
        category: 'cat-1',
        page: 1,
        perPage: 20,
      });
    });
  });

  describe('listCategories', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce({ data: mockCategories });
      const result = await listCategories();
      expect(get).toHaveBeenCalledWith('/benefits/categories');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getPartnerDetails', () => {
    it('should call get with correct URL', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockPartnerDetail);
      const result = await getPartnerDetails('partner-1');
      expect(get).toHaveBeenCalledWith('/benefits/partner-1');
      expect(result).toEqual(mockPartnerDetail);
    });

    it('should handle different partner IDs', async () => {
      vi.mocked(get).mockResolvedValueOnce(mockPartnerDetail);
      await getPartnerDetails('partner-99');
      expect(get).toHaveBeenCalledWith('/benefits/partner-99');
    });
  });
});
