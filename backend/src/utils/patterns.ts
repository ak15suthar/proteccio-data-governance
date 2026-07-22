export const SENSITIVE_PATTERNS = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    type: 'email',
    confidence: 0.95,
  },
  phone: {
    pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
    type: 'phone',
    confidence: 0.9,
  },
  name: {
    pattern: /^[A-Z][a-z]+ [A-Z][a-z]+$/,
    type: 'name',
    confidence: 0.7,
  },
  ssn: {
    pattern: /^\d{3}-?\d{2}-?\d{4}$/,
    type: 'ssn',
    confidence: 0.98,
  },
  creditCard: {
    pattern: /^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/,
    type: 'credit_card',
    confidence: 0.95,
  },
  address: {
    pattern: /^\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Court|Ct|Lane|Ln)/i,
    type: 'address',
    confidence: 0.8,
  },
  ip_address: {
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    type: 'ip_address',
    confidence: 0.99,
  },
  date_of_birth: {
    pattern: /^(?:0[1-9]|[12][0-9]|3[01])[-\/](?:0[1-9]|1[0-2])[-\/](?:19|20)\d{2}$/,
    type: 'date_of_birth',
    confidence: 0.85,
  },
};

export const DATA_TYPE_PATTERNS = {
  integer: /^-?\d+$/,
  float: /^-?\d+\.\d+$/,
  boolean: /^(true|false|yes|no|0|1)$/i,
  date: /^\d{4}[-\/](?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12][0-9]|3[01])$/,
  datetime: /^\d{4}[-\/](?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12][0-9]|3[01])[T ]\d{2}:\d{2}/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\//,
  string: /.*/,
};
