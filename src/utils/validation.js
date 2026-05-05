export const PATTERNS = {
  name: /^[a-zA-Z\s'\-]{2,60}$/,
  email: /^[a-zA-Z0-9._%+\-]{1,64}@[a-zA-Z0-9.\-]{1,253}\.[a-zA-Z]{2,}$/,
  password: /^[\x20-\x7E]{6,128}$/,
  accountNumber: /^\d{6,34}$/,
  swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
  amount: /^\d{1,10}(\.\d{1,2})?$/,
  reference: /^[a-zA-Z0-9\s\-#/]{0,100}$/,
};

export const sanitise = (value) =>
  value.replace(/[<>"'`;(){}[\]\\]/g, '').trim();

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
