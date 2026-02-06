import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  newPasswordSchema,
  updateProfileSchema,
  transferPointsSchema,
  adminGrantPointsSchema,
  adminDeductPointsSchema,
  subscribeSchema,
  createPlanSchema,
  paginationSchema,
} from '../validation/index';

// ============================================
// loginSchema
// ============================================
describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'user@example.com' }).success).toBe(false);
  });
});

// ============================================
// registerSchema
// ============================================
describe('registerSchema', () => {
  const validData = {
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'Abc12345',
  };

  it('should validate correct register data', () => {
    expect(registerSchema.safeParse(validData).success).toBe(true);
  });

  it('should accept optional phone', () => {
    expect(
      registerSchema.safeParse({ ...validData, phone: '11999887766' }).success
    ).toBe(true);
  });

  it('should reject short name', () => {
    expect(
      registerSchema.safeParse({ ...validData, name: 'A' }).success
    ).toBe(false);
  });

  it('should reject password without uppercase', () => {
    expect(
      registerSchema.safeParse({ ...validData, password: 'abc12345' }).success
    ).toBe(false);
  });

  it('should reject password without lowercase', () => {
    expect(
      registerSchema.safeParse({ ...validData, password: 'ABC12345' }).success
    ).toBe(false);
  });

  it('should reject password without number', () => {
    expect(
      registerSchema.safeParse({ ...validData, password: 'Abcdefgh' }).success
    ).toBe(false);
  });

  it('should reject password shorter than 8 characters', () => {
    expect(
      registerSchema.safeParse({ ...validData, password: 'Abc123' }).success
    ).toBe(false);
  });
});

// ============================================
// refreshTokenSchema
// ============================================
describe('refreshTokenSchema', () => {
  it('should validate non-empty token', () => {
    expect(
      refreshTokenSchema.safeParse({ refreshToken: 'some-token' }).success
    ).toBe(true);
  });

  it('should reject empty token', () => {
    expect(
      refreshTokenSchema.safeParse({ refreshToken: '' }).success
    ).toBe(false);
  });
});

// ============================================
// resetPasswordSchema
// ============================================
describe('resetPasswordSchema', () => {
  it('should validate correct email', () => {
    expect(
      resetPasswordSchema.safeParse({ email: 'user@example.com' }).success
    ).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(
      resetPasswordSchema.safeParse({ email: 'invalid' }).success
    ).toBe(false);
  });
});

// ============================================
// newPasswordSchema
// ============================================
describe('newPasswordSchema', () => {
  it('should validate correct data', () => {
    expect(
      newPasswordSchema.safeParse({ token: 'abc123', password: 'NewPass1' }).success
    ).toBe(true);
  });

  it('should reject empty token', () => {
    expect(
      newPasswordSchema.safeParse({ token: '', password: 'NewPass1' }).success
    ).toBe(false);
  });

  it('should reject weak password', () => {
    expect(
      newPasswordSchema.safeParse({ token: 'abc', password: 'weak' }).success
    ).toBe(false);
  });

  it('should reject password without uppercase', () => {
    expect(
      newPasswordSchema.safeParse({ token: 'abc', password: 'newpass1' }).success
    ).toBe(false);
  });
});

// ============================================
// updateProfileSchema
// ============================================
describe('updateProfileSchema', () => {
  it('should validate partial update', () => {
    expect(
      updateProfileSchema.safeParse({ name: 'New Name' }).success
    ).toBe(true);
  });

  it('should validate empty object (all optional)', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it('should reject short name', () => {
    expect(
      updateProfileSchema.safeParse({ name: 'A' }).success
    ).toBe(false);
  });

  it('should reject invalid avatar URL', () => {
    expect(
      updateProfileSchema.safeParse({ avatarUrl: 'not-a-url' }).success
    ).toBe(false);
  });

  it('should accept valid avatar URL', () => {
    expect(
      updateProfileSchema.safeParse({ avatarUrl: 'https://example.com/avatar.jpg' }).success
    ).toBe(true);
  });
});

// ============================================
// transferPointsSchema
// ============================================
describe('transferPointsSchema', () => {
  // Use a valid CUID for testing
  const validCuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx';

  it('should validate correct transfer data', () => {
    const result = transferPointsSchema.safeParse({
      toUserId: validCuid,
      amount: 100,
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional description', () => {
    const result = transferPointsSchema.safeParse({
      toUserId: validCuid,
      amount: 50,
      description: 'Transfer test',
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative amount', () => {
    expect(
      transferPointsSchema.safeParse({ toUserId: validCuid, amount: -10 }).success
    ).toBe(false);
  });

  it('should reject zero amount', () => {
    expect(
      transferPointsSchema.safeParse({ toUserId: validCuid, amount: 0 }).success
    ).toBe(false);
  });

  it('should reject invalid userId', () => {
    expect(
      transferPointsSchema.safeParse({ toUserId: 'invalid', amount: 100 }).success
    ).toBe(false);
  });
});

// ============================================
// adminGrantPointsSchema
// ============================================
describe('adminGrantPointsSchema', () => {
  const validCuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx';

  it('should validate correct grant data', () => {
    expect(
      adminGrantPointsSchema.safeParse({
        userId: validCuid,
        amount: 500,
        description: 'Bonus',
      }).success
    ).toBe(true);
  });

  it('should reject zero amount', () => {
    expect(
      adminGrantPointsSchema.safeParse({
        userId: validCuid,
        amount: 0,
      }).success
    ).toBe(false);
  });

  it('should reject long description', () => {
    expect(
      adminGrantPointsSchema.safeParse({
        userId: validCuid,
        amount: 100,
        description: 'x'.repeat(256),
      }).success
    ).toBe(false);
  });
});

// ============================================
// adminDeductPointsSchema
// ============================================
describe('adminDeductPointsSchema', () => {
  const validCuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx';

  it('should validate correct deduct data', () => {
    expect(
      adminDeductPointsSchema.safeParse({
        userId: validCuid,
        amount: 50,
        reason: 'Penalty',
      }).success
    ).toBe(true);
  });

  it('should reject empty reason', () => {
    expect(
      adminDeductPointsSchema.safeParse({
        userId: validCuid,
        amount: 50,
        reason: '',
      }).success
    ).toBe(false);
  });

  it('should reject missing reason', () => {
    expect(
      adminDeductPointsSchema.safeParse({
        userId: validCuid,
        amount: 50,
      }).success
    ).toBe(false);
  });
});

// ============================================
// subscribeSchema
// ============================================
describe('subscribeSchema', () => {
  it('should validate correct plan ID', () => {
    expect(
      subscribeSchema.safeParse({ planId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx' }).success
    ).toBe(true);
  });

  it('should reject invalid plan ID', () => {
    expect(
      subscribeSchema.safeParse({ planId: 'invalid-id' }).success
    ).toBe(false);
  });
});

// ============================================
// createPlanSchema
// ============================================
describe('createPlanSchema', () => {
  const validPlan = {
    name: 'Premium',
    price: 2990,
    interval: 'MONTHLY' as const,
  };

  it('should validate correct plan data with defaults', () => {
    const result = createPlanSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pointsMultiplier).toBe(1);
      expect(result.data.storeDiscount).toBe(0);
      expect(result.data.pdvDiscount).toBe(0);
      expect(result.data.spaceDiscount).toBe(0);
      expect(result.data.verifiedBadge).toBe(false);
    }
  });

  it('should accept optional description', () => {
    expect(
      createPlanSchema.safeParse({
        ...validPlan,
        description: 'Premium plan with benefits',
      }).success
    ).toBe(true);
  });

  it('should reject invalid interval', () => {
    expect(
      createPlanSchema.safeParse({ ...validPlan, interval: 'WEEKLY' }).success
    ).toBe(false);
  });

  it('should reject negative price', () => {
    expect(
      createPlanSchema.safeParse({ ...validPlan, price: -100 }).success
    ).toBe(false);
  });

  it('should reject multiplier out of range', () => {
    expect(
      createPlanSchema.safeParse({ ...validPlan, pointsMultiplier: 15 }).success
    ).toBe(false);
  });

  it('should reject discount over 100', () => {
    expect(
      createPlanSchema.safeParse({ ...validPlan, storeDiscount: 150 }).success
    ).toBe(false);
  });
});

// ============================================
// paginationSchema
// ============================================
describe('paginationSchema', () => {
  it('should use defaults for empty input', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('should coerce string numbers', () => {
    const result = paginationSchema.safeParse({ page: '3', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it('should reject limit over 100', () => {
    expect(
      paginationSchema.safeParse({ limit: 101 }).success
    ).toBe(false);
  });

  it('should reject negative page', () => {
    expect(
      paginationSchema.safeParse({ page: -1 }).success
    ).toBe(false);
  });

  it('should accept sortBy and sortOrder', () => {
    const result = paginationSchema.safeParse({
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortBy).toBe('createdAt');
      expect(result.data.sortOrder).toBe('asc');
    }
  });

  it('should reject invalid sortOrder', () => {
    expect(
      paginationSchema.safeParse({ sortOrder: 'random' }).success
    ).toBe(false);
  });
});
