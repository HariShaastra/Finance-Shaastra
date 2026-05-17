export interface TransactionSuggestion {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: Date;
  rawText: string;
}

const SMS_PATTERNS = [
  // UPI / Debit Patterns
  {
    regex: /Debited by (?:Rs\.|INR|₹)\s?([0-9,.]+).*?to (.*?) Ref/i,
    type: 'expense' as const,
    category: 'UPI'
  },
  {
    regex: /(?:Rs\.|INR|₹)\s?([0-9,.]+).*?debited.*?at (.*?)./i,
    type: 'expense' as const,
    category: 'Payment'
  },
  {
    regex: /Sent (?:Rs\.|INR|₹)\s?([0-9,.]+).*?to (.*?)\s/i,
    type: 'expense' as const,
    category: 'Transfer'
  },
  // Credit Patterns
  {
    regex: /(?:Rs\.|INR|₹)\s?([0-9,.]+).*?credited.*?from (.*?)./i,
    type: 'income' as const,
    category: 'Income'
  },
  {
    regex: /Received (?:Rs\.|INR|₹)\s?([0-9,.]+).*?from (.*?)\.?/i,
    type: 'income' as const,
    category: 'Income'
  }
];

export function parseTransactionSMS(text: string): TransactionSuggestion | null {
  for (const pattern of SMS_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const merchant = match[2]?.trim() || 'Unknown';
      
      if (!isNaN(amount)) {
        return {
          type: pattern.type,
          amount,
          category: pattern.category,
          note: `Auto-parsed: ${merchant}`,
          date: new Date(),
          rawText: text
        };
      }
    }
  }
  return null;
}
