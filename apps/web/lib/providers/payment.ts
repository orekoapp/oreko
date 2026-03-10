export interface CheckoutParams {
  invoiceId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  sessionId: string;
  url: string;
}

export interface WebhookResult {
  eventType: string;
  invoiceId?: string;
  paymentId?: string;
  amount?: number;
}

export interface RefundResult {
  refundId: string;
  amount: number;
  status: string;
}

export interface PaymentProvider {
  name: string;
  isEnabled(): boolean;
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;
  processWebhook(request: Request): Promise<WebhookResult>;
  refund(paymentId: string, amount?: number): Promise<RefundResult>;
}
