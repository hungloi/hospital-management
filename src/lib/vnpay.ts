import crypto from 'crypto';
import { format } from 'date-fns';

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || 'SANDBOX';
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || 'SANDBOX_SECRET_KEY_DO_NOT_USE_IN_PROD';
const VNPAY_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/callback';

function sortObject(obj: Record<string, string>) {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => { sorted[key] = obj[key]; });
  return sorted;
}

export function createVNPayUrl({
  amount,
  orderInfo,
  txnRef,
  ipAddr = '127.0.0.1',
}: {
  amount: number;   // VND
  orderInfo: string;
  txnRef: string;   // Mã tham chiếu duy nhất
  ipAddr?: string;
}): string {
  const date = new Date();
  const createDate = format(date, 'yyyyMMddHHmmss');
  
  const params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Amount: String(amount * 100), // VNPay tính theo đơn vị 1/100 VND
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const sorted = sortObject(params);
  const signData = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const query = new URLSearchParams({ ...sorted, vnp_SecureHash: signature });
  return `${VNPAY_URL}?${query.toString()}`;
}

export function verifyVNPayCallback(query: Record<string, string>): {
  isValid: boolean;
  responseCode: string;
  txnRef: string;
  amount: number;
} {
  const { vnp_SecureHash, ...rest } = query;
  const sorted = sortObject(rest as Record<string, string>);
  const signData = new URLSearchParams(sorted).toString();
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const expectedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return {
    isValid: expectedHash === vnp_SecureHash,
    responseCode: query.vnp_ResponseCode || '',
    txnRef: query.vnp_TxnRef || '',
    amount: Number(query.vnp_Amount || 0) / 100,
  };
}
