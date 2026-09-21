'use client';
import { post } from './_client';

export async function submitLabResult(orderId: string, result: string) {
  return post('/api/lab/submit', { orderId, result });
}
