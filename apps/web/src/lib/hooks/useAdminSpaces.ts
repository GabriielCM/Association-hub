'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminSpaces,
  getAdminSpace,
  createSpace,
  updateSpace,
  deleteSpace,
  updateSpaceStatus,
  getSpaceBlocks,
  createSpaceBlock,
  createBulkBlocks,
  deleteSpaceBlock,
  getSpaceAvailability,
  uploadSpaceImage,
  removeSpaceImage,
} from '@/lib/api/spaces.api';
import type { SpaceStatus, CreateSpaceInput } from '@/lib/api/spaces.api';

// ===========================================
// QUERY KEYS
// ===========================================

export const spacesAdminKeys = {
  all: ['admin', 'spaces'] as const,
  list: (query?: Record<string, unknown>) =>
    [...spacesAdminKeys.all, 'list', query] as const,
  detail: (id: string) =>
    [...spacesAdminKeys.all, 'detail', id] as const,
  blocks: (id: string) =>
    [...spacesAdminKeys.all, 'blocks', id] as const,
  availability: (id: string, startDate: string, endDate: string) =>
    [...spacesAdminKeys.all, 'avail', id, startDate, endDate] as const,
};

// ===========================================
// QUERIES
// ===========================================

export function useAdminSpaces(query?: { status?: SpaceStatus }) {
  return useQuery({
    queryKey: spacesAdminKeys.list(query as Record<string, unknown>),
    queryFn: () => getAdminSpaces(query),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminSpace(id: string) {
  return useQuery({
    queryKey: spacesAdminKeys.detail(id),
    queryFn: () => getAdminSpace(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useSpaceBlocks(spaceId: string) {
  return useQuery({
    queryKey: spacesAdminKeys.blocks(spaceId),
    queryFn: () => getSpaceBlocks(spaceId),
    enabled: !!spaceId,
    staleTime: 30 * 1000,
  });
}

export function useSpaceAvailability(
  spaceId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: spacesAdminKeys.availability(spaceId, startDate, endDate),
    queryFn: () => getSpaceAvailability(spaceId, startDate, endDate),
    enabled: !!spaceId && !!startDate && !!endDate,
    staleTime: 30 * 1000,
  });
}

// ===========================================
// MUTATIONS
// ===========================================

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSpaceInput) => createSpace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateSpaceInput> & { status?: SpaceStatus };
    }) => updateSpace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useUpdateSpaceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SpaceStatus }) =>
      updateSpaceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useCreateSpaceBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      spaceId,
      data,
    }: {
      spaceId: string;
      data: { date: string; reason?: string };
    }) => createSpaceBlock(spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useCreateBulkBlocks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      spaceId,
      data,
    }: {
      spaceId: string;
      data: { dates: string[]; reason?: string };
    }) => createBulkBlocks(spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useDeleteSpaceBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      spaceId,
      blockId,
    }: {
      spaceId: string;
      blockId: string;
    }) => deleteSpaceBlock(spaceId, blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useUploadSpaceImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, file }: { spaceId: string; file: File }) =>
      uploadSpaceImage(spaceId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}

export function useRemoveSpaceImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      spaceId,
      imageUrl,
    }: {
      spaceId: string;
      imageUrl: string;
    }) => removeSpaceImage(spaceId, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spacesAdminKeys.all });
    },
  });
}
