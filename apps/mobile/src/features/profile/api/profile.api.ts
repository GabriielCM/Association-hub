import { get, put } from '@/services/api/client';
import { api } from '@/services/api/client';
import type {
  UserProfile,
  UserBadgesResponse,
  CoverUploadResult,
  UserRankingsResponse,
  UsernameCheckResponse,
  UpdateProfileResult,
  AvatarUploadResult,
  UpdateBadgesDisplayResult,
} from '@ahub/shared/types';

export async function getProfile(userId: string): Promise<UserProfile> {
  return get<UserProfile>(`/user/${userId}/profile`);
}

export async function getUserBadges(userId: string): Promise<UserBadgesResponse> {
  return get<UserBadgesResponse>(`/user/${userId}/badges`);
}

export async function getUserRankings(userId: string): Promise<UserRankingsResponse> {
  return get<UserRankingsResponse>(`/user/${userId}/rankings`);
}

export async function updateProfile(data: {
  name?: string | undefined;
  username?: string | undefined;
  bio?: string | undefined;
  phone?: string | undefined;
  socialLinks?: {
    instagram?: string | undefined;
    facebook?: string | undefined;
    x?: string | undefined;
  } | undefined;
}): Promise<UpdateProfileResult> {
  return put<UpdateProfileResult>('/user/profile', data);
}

export async function uploadAvatar(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<AvatarUploadResult> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  const response = await api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Upload failed');
  }
  return response.data.data;
}

export async function uploadCover(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<CoverUploadResult> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);

  const response = await api.post('/user/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Upload failed');
  }
  return response.data.data;
}

export async function updateBadgesDisplay(
  badgeIds: string[]
): Promise<UpdateBadgesDisplayResult> {
  return put<UpdateBadgesDisplayResult>('/user/badges/display', { badgeIds });
}

export async function checkUsername(
  username: string
): Promise<UsernameCheckResponse> {
  return get<UsernameCheckResponse>('/user/username/check', { username });
}
