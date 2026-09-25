import type { ContactFormPayload, ContactResponse } from '@shared/types';
import { http } from '@/lib/api/httpClient';

/** Send a contact message (throttled + logged server-side). */
export async function sendContact(payload: ContactFormPayload): Promise<ContactResponse> {
  return http.post<ContactResponse>('/contact', payload);
}