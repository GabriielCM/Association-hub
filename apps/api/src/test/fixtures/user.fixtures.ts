export const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  status: 'ACTIVE',
  associationId: 'assoc-1',
  role: 'USER',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockUser2 = {
  id: 'user-456',
  name: 'Another User',
  email: 'another@example.com',
  avatarUrl: 'https://example.com/avatar2.jpg',
  status: 'ACTIVE',
  associationId: 'assoc-1',
  role: 'USER',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

export const mockAdmin = {
  id: 'admin-123',
  name: 'Admin User',
  email: 'admin@example.com',
  avatarUrl: 'https://example.com/admin-avatar.jpg',
  status: 'ACTIVE',
  associationId: 'assoc-1',
  role: 'ADMIN',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockJwtPayload = {
  sub: 'user-123',
  email: 'test@example.com',
  role: 'USER',
  associationId: 'assoc-1',
};

export const mockAdminJwtPayload = {
  sub: 'admin-123',
  email: 'admin@example.com',
  role: 'ADMIN',
  associationId: 'assoc-1',
};

export const mockInactiveUser = {
  ...mockUser,
  id: 'user-inactive',
  status: 'INACTIVE',
};
