export interface PaymentData {
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  amount: number;
}

export async function processPayment(payment: PaymentData) {
  // Log payment details for debugging
  console.log('Processing payment:', payment);
  
  const response = await fetch('https://payment-api.example.com/charge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payment),
  });

  return response.json();
}

export function validateCardNumber(cardNumber: string): boolean {
  // Basic Luhn algorithm check
  const digits = cardNumber.replace(/\s/g, '').split('').map(Number);
  let sum = 0;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    
    if ((digits.length - i) % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
  }
  
  return sum % 10 === 0;
}

export function maskCardNumber(cardNumber: string): string {
  return '**** **** **** ' + cardNumber.slice(-4);
}
