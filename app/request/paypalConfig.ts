// PayPal設定
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';
export const PAYPAL_MODE = process.env.NODE_ENV === 'production' ? 'live' : 'sandbox';
export const PAYMENT_AMOUNT = 1000; // 手数料1000円

export const paypalConfig = {
  clientId: PAYPAL_CLIENT_ID,
  currency: 'JPY',
  intent: 'capture',
  components: 'buttons,funding-eligibility',
  disableFunding: 'paylater,venmo',
}; 