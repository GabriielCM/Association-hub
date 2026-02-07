import { get } from '@/services/api/client';
import type {
  MemberCard,
  CardQrCode,
  CardHistoryResponse,
  CardStatus,
} from '@ahub/shared/types';

export async function getCard(): Promise<MemberCard> {
  return get<MemberCard>('/user/card');
}

export async function getCardStatus(): Promise<{
  status: CardStatus;
  statusReason?: string;
}> {
  return get('/user/card/status');
}

export async function getQrCode(): Promise<CardQrCode> {
  return get<CardQrCode>('/user/card/qrcode');
}

export async function getCardHistory(query?: {
  page?: number;
  perPage?: number;
  type?: string;
}): Promise<CardHistoryResponse> {
  return get<CardHistoryResponse>('/user/card/history', query);
}
