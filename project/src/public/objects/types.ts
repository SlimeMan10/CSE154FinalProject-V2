export type PaymentFields = {
  cardHolder: string;       // Cardholder name
  cardNumber: string;       // Card number (numeric string, possibly with spaces or dashes)
  cardExpiry: string;       // Card expiry date in MM/YY format
  cardCVV: string;          // CVV code (usually 3 or 4 numeric digits)
  billingAddress: string;   // Billing address
};

export type Product = {
  name: string;                  // Product name
  description: string;           // Product description
  price: number;                 // Product price
  stock: number;                 // Stock quantity
  product_id: number;            // Unique product identifier (number instead of string)
  type: string;                  // Product type/category
  average_rating: number;        // Average rating
  total_ratings: number;         // Total number of ratings
  review_usernames: string;      // Comma-separated usernames of reviewers (still a string)
};

export type purchaseFields = {
  message: string,
  confirmationCode: string
};