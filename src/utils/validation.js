// Centralised input whitelist validation using strict regex patterns.
// Every field must match its pattern — anything outside is rejected.

export const PATTERNS = {
  // Full name: letters, spaces, hyphens, apostrophes only (2–60 chars)
  name: /^[a-zA-Z\s'\-]{2,60}$/,

  // Standard email format
  email: /^[a-zA-Z0-9._%+\-]{1,64}@[a-zA-Z0-9.\-]{1,253}\.[a-zA-Z]{2,}$/,

  // Password: min 6, max 128 chars, printable ASCII only (no control chars)
  password: /^[\x20-\x7E]{6,128}$/,

  // Account number / IBAN: digits only, 6–34 chars
  accountNumber: /^\d{6,34}$/,

  // SWIFT/BIC: 8 or 11 uppercase alphanumeric chars
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,

  // Amount: positive decimal, up to 2 decimal places, max 10 digits before decimal
  amount: /^\d{1,10}(\.\d{1,2})?$/,

  // Payment reference: alphanumeric, spaces, hyphens, #, / (optional, max 100 chars)
  reference: /^[a-zA-Z0-9\s\-#/]{0,100}$/,
};

// Sanitise: strip any character not in the allowed whitelist for each field
export const sanitise = (value) =>
  value.replace(/[<>"'`;(){}[\]\\]/g, '').trim();

// Login / Register validators
export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  const cleanEmail = sanitise(email);
  const cleanPassword = sanitise(password);

  if (!cleanEmail) {
    errors.email = 'Email is required';
  } else if (!PATTERNS.email.test(cleanEmail)) {
    errors.email = 'Enter a valid email address';
  }

  if (!cleanPassword) {
    errors.password = 'Password is required';
  } else if (!PATTERNS.password.test(cleanPassword)) {
    errors.password = 'Password must be 6–128 printable characters';
  }

  return errors;
};

export const validateRegisterForm = ({ name, email, password }) => {
  const errors = {};

  const cleanName = sanitise(name);
  const cleanEmail = sanitise(email);
  const cleanPassword = sanitise(password);

  if (!cleanName) {
    errors.name = 'Name is required';
  } else if (!PATTERNS.name.test(cleanName)) {
    errors.name = 'Name may only contain letters, spaces, hyphens or apostrophes (2–60 chars)';
  }

  if (!cleanEmail) {
    errors.email = 'Email is required';
  } else if (!PATTERNS.email.test(cleanEmail)) {
    errors.email = 'Enter a valid email address';
  }

  if (!cleanPassword) {
    errors.password = 'Password is required';
  } else if (!PATTERNS.password.test(cleanPassword)) {
    errors.password = 'Password must be 6–128 printable characters';
  }

  return errors;
};

// Payment portal validators
export const validatePaymentForm = ({ recipientName, recipientAccount, recipientBank, swiftCode, amount, reference }) => {
  const errors = {};

  const cleanName = sanitise(recipientName);
  const cleanAccount = sanitise(recipientAccount);
  const cleanSwift = sanitise(swiftCode).toUpperCase();
  const cleanAmount = sanitise(String(amount));
  const cleanRef = sanitise(reference);

  if (!cleanName) {
    errors.recipientName = 'Recipient name is required';
  } else if (!PATTERNS.name.test(cleanName)) {
    errors.recipientName = 'Name may only contain letters, spaces, hyphens or apostrophes';
  }

  if (!cleanAccount) {
    errors.recipientAccount = 'Account number is required';
  } else if (!PATTERNS.accountNumber.test(cleanAccount)) {
    errors.recipientAccount = 'Account number must be 6–34 digits only';
  }

  if (!recipientBank) {
    errors.recipientBank = 'Please select a bank';
  }

  if (!cleanSwift) {
    errors.swiftCode = 'SWIFT/BIC code is required';
  } else if (cleanSwift !== 'N/A' && !PATTERNS.swiftCode.test(cleanSwift)) {
    errors.swiftCode = 'Enter a valid SWIFT/BIC code (e.g. FIRNZAJJ or BARCGB22XXX)';
  }

  if (!cleanAmount) {
    errors.amount = 'Amount is required';
  } else if (!PATTERNS.amount.test(cleanAmount) || parseFloat(cleanAmount) <= 0) {
    errors.amount = 'Enter a valid positive amount (e.g. 1500.00)';
  }

  if (reference && !PATTERNS.reference.test(cleanRef)) {
    errors.reference = 'Reference may only contain letters, numbers, spaces, - # /';
  }

  return errors;
};
