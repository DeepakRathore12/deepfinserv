/**
 * Pushes events to Google Tag Manager's dataLayer. GTM forwards them to GA4 once the visitor has
 * accepted analytics cookies. Never include personal data (mobile, PAN, name, exact income).
 */
type EventName =
  | 'cta_click'
  | 'loan_matcher_start'
  | 'otp_sent'
  | 'otp_verified'
  | 'lead_created'
  | 'offers_viewed'
  | 'offer_selected'
  | 'application_submitted'
  | 'score_requested'
  | 'callback_requested'
  | 'partner_applied'
  | 'grievance_submitted';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: EventName, params: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
