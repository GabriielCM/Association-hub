import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PointsController, AdminPointsController } from './points.controller';
import { PointsService } from './points.service';
import { mockJwtPayload, mockAdminJwtPayload } from '../../test/fixtures/user.fixtures';
import { SummaryPeriod, ReportPeriod } from './dto';

describe('PointsController', () => {
  let controller: PointsController;
  let service: any;

  beforeEach(() => {
    service = {
      getBalance: vi.fn(),
      getHistory: vi.fn(),
      getSummary: vi.fn(),
      transferPoints: vi.fn(),
      getRecentRecipients: vi.fn(),
      searchUsersForTransfer: vi.fn(),
    };

    controller = new PointsController(service);
  });

  describe('getBalance', () => {
    it('should call service.getBalance with user.sub', async () => {
      const mockBalance = { balance: 1000, lifetimeEarned: 5000, lifetimeSpent: 4000 };
      service.getBalance.mockResolvedValue(mockBalance);

      const result = await controller.getBalance(mockJwtPayload as any);

      expect(service.getBalance).toHaveBeenCalledWith(mockJwtPayload.sub);
      expect(result.data).toEqual(mockBalance);
    });
  });

  describe('getHistory', () => {
    it('should pass query params to service', async () => {
      const mockHistory = { data: [], meta: { currentPage: 1, perPage: 20, totalPages: 0, totalCount: 0 } };
      const query = { page: 2, perPage: 10 };
      service.getHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistory(mockJwtPayload as any, query);

      expect(service.getHistory).toHaveBeenCalledWith(mockJwtPayload.sub, query);
      expect(result).toEqual(mockHistory);
    });
  });

  describe('getSummary', () => {
    it('should use default period MONTH when not specified', async () => {
      const mockSummary = { period: SummaryPeriod.MONTH, earned: 100, spent: 50, net: 50 };
      service.getSummary.mockResolvedValue(mockSummary);

      await controller.getSummary(mockJwtPayload as any, {});

      expect(service.getSummary).toHaveBeenCalledWith(mockJwtPayload.sub, SummaryPeriod.MONTH);
    });

    it('should pass custom period to service', async () => {
      const mockSummary = { period: SummaryPeriod.WEEK, earned: 50, spent: 25, net: 25 };
      service.getSummary.mockResolvedValue(mockSummary);

      await controller.getSummary(mockJwtPayload as any, { period: SummaryPeriod.WEEK });

      expect(service.getSummary).toHaveBeenCalledWith(mockJwtPayload.sub, SummaryPeriod.WEEK);
    });
  });

  describe('transfer', () => {
    it('should call service.transferPoints with DTO values', async () => {
      const dto = { recipientId: 'user-456', amount: 100, message: 'Test' };
      const mockResult = { transactionId: 'tx-1', amount: 100 };
      service.transferPoints.mockResolvedValue(mockResult);

      const result = await controller.transfer(mockJwtPayload as any, dto);

      expect(service.transferPoints).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        dto.recipientId,
        dto.amount,
        dto.message,
      );
      expect(result.data).toEqual(mockResult);
      expect(result.message).toBe('Transferência realizada com sucesso');
    });
  });

  describe('getRecentRecipients', () => {
    it('should pass limit to service', async () => {
      const mockRecipients = [{ userId: 'user-456', name: 'Test' }];
      service.getRecentRecipients.mockResolvedValue(mockRecipients);

      const result = await controller.getRecentRecipients(mockJwtPayload as any, { limit: 5 });

      expect(service.getRecentRecipients).toHaveBeenCalledWith(mockJwtPayload.sub, 5);
      expect(result.data).toEqual(mockRecipients);
    });
  });

  describe('searchUsersForTransfer', () => {
    it('should pass query params to service', async () => {
      const mockUsers = [{ userId: 'user-456', name: 'Another User' }];
      service.searchUsersForTransfer.mockResolvedValue(mockUsers);

      const result = await controller.searchUsersForTransfer(
        mockJwtPayload as any,
        { q: 'Another', limit: 10 },
      );

      expect(service.searchUsersForTransfer).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        'Another',
        10,
      );
      expect(result.data).toEqual(mockUsers);
    });
  });
});

describe('AdminPointsController', () => {
  let controller: AdminPointsController;
  let service: any;

  beforeEach(() => {
    service = {
      getConfig: vi.fn(),
      updateConfig: vi.fn(),
      adminGrantPoints: vi.fn(),
      adminDeductPoints: vi.fn(),
      adminRefundTransaction: vi.fn(),
      getReports: vi.fn(),
    };

    controller = new AdminPointsController(service);
  });

  describe('getConfig', () => {
    it('should call service.getConfig with associationId', async () => {
      const mockConfig = { sources: [], pointsToMoneyRate: 0.5 };
      service.getConfig.mockResolvedValue(mockConfig);

      const result = await controller.getConfig(mockAdminJwtPayload as any);

      expect(service.getConfig).toHaveBeenCalledWith(mockAdminJwtPayload.associationId);
      expect(result.data).toEqual(mockConfig);
    });
  });

  describe('updateConfig', () => {
    it('should pass associationId and DTO to service', async () => {
      const dto = { checkInPoints: 100 };
      service.updateConfig.mockResolvedValue({ updated: true });

      const result = await controller.updateConfig(mockAdminJwtPayload as any, dto);

      expect(service.updateConfig).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        dto,
      );
      expect(result.data.updated).toBe(true);
    });
  });

  describe('grantPoints', () => {
    it('should pass adminId and DTO values to service', async () => {
      const dto = { userId: 'user-123', amount: 100, reason: 'Bonus' };
      const mockResult = { transactionId: 'tx-1', amount: 100 };
      service.adminGrantPoints.mockResolvedValue(mockResult);

      const result = await controller.grantPoints(mockAdminJwtPayload as any, dto);

      expect(service.adminGrantPoints).toHaveBeenCalledWith(
        mockAdminJwtPayload.sub,
        dto.userId,
        dto.amount,
        dto.reason,
      );
      expect(result.data).toEqual(mockResult);
    });
  });

  describe('deductPoints', () => {
    it('should pass adminId and DTO values to service', async () => {
      const dto = { userId: 'user-123', amount: 50, reason: 'Penalty' };
      const mockResult = { transactionId: 'tx-2', amount: 50 };
      service.adminDeductPoints.mockResolvedValue(mockResult);

      const result = await controller.deductPoints(mockAdminJwtPayload as any, dto);

      expect(service.adminDeductPoints).toHaveBeenCalledWith(
        mockAdminJwtPayload.sub,
        dto.userId,
        dto.amount,
        dto.reason,
      );
      expect(result.data).toEqual(mockResult);
    });
  });

  describe('refundTransaction', () => {
    it('should pass transactionId and reason to service', async () => {
      const dto = { reason: 'Error' };
      const mockResult = { refundTransactionId: 'tx-refund' };
      service.adminRefundTransaction.mockResolvedValue(mockResult);

      const result = await controller.refundTransaction(
        mockAdminJwtPayload as any,
        'tx-123',
        dto,
      );

      expect(service.adminRefundTransaction).toHaveBeenCalledWith(
        mockAdminJwtPayload.sub,
        'tx-123',
        dto.reason,
      );
      expect(result.data).toEqual(mockResult);
    });
  });

  describe('getReports', () => {
    it('should use default period MONTH when not specified', async () => {
      const mockReport = { summary: {}, topEarners: [] };
      service.getReports.mockResolvedValue(mockReport);

      await controller.getReports(mockAdminJwtPayload as any, {});

      expect(service.getReports).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        ReportPeriod.MONTH,
      );
    });

    it('should pass custom period to service', async () => {
      const mockReport = { summary: {}, topEarners: [] };
      service.getReports.mockResolvedValue(mockReport);

      await controller.getReports(mockAdminJwtPayload as any, { period: ReportPeriod.WEEK });

      expect(service.getReports).toHaveBeenCalledWith(
        mockAdminJwtPayload.associationId,
        ReportPeriod.WEEK,
      );
    });
  });
});
