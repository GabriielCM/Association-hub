import { get, post } from '@/services/api/client';
import type {
  WalletDashboard,
  WalletSummary,
  WalletSummaryPeriod,
  QrScanResult,
  PdvCheckoutDetails,
  PdvPaymentResult,
  PdvPixPaymentResult,
  PdvPixStatus,
} from '@ahub/shared/types';

export async function getWalletDashboard(): Promise<WalletDashboard> {
  return get<WalletDashboard>('/wallet');
}

export async function getWalletSummary(
  period: WalletSummaryPeriod = 'month'
): Promise<WalletSummary> {
  return get<WalletSummary>('/wallet/summary', { period });
}

export async function scanQrCode(data: {
  qrCodeData: string;
  qrCodeHash: string;
}): Promise<QrScanResult> {
  return post<QrScanResult>('/wallet/scan', data);
}

export async function getCheckoutDetails(
  code: string
): Promise<PdvCheckoutDetails> {
  return get<PdvCheckoutDetails>(`/wallet/pdv/checkout/${code}`);
}

export async function payPdvCheckout(data: {
  checkoutCode: string;
  biometricConfirmed?: boolean;
}): Promise<PdvPaymentResult> {
  return post<PdvPaymentResult>(`/wallet/pdv/checkout/${data.checkoutCode}/pay`, {
    biometricConfirmed: data.biometricConfirmed,
  });
}

export async function initiatePixPayment(
  code: string
): Promise<PdvPixPaymentResult> {
  return post<PdvPixPaymentResult>(`/wallet/pdv/checkout/${code}/pix`, {});
}

export async function getPixStatus(
  code: string
): Promise<PdvPixStatus> {
  return get<PdvPixStatus>(`/wallet/pdv/checkout/${code}/pix-status`);
}
