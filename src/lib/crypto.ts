/**
 * Crypto Utility - AES Encryption/Decryption
 * Migrated from AppHomeController.js CryptoJS patterns
 * Maintains exact encryption compatibility with backend
 */
import CryptoJS from 'crypto-js';

// Encryption keys matching original AngularJS implementation
const SECRET_KEY = CryptoJS.enc.Utf8.parse('0123456789abcdef0123456789abcdef'); // 32 bytes (256 bits)
const INIT_VECTOR = CryptoJS.enc.Utf8.parse('0123456789abcdef'); // 16 bytes

/**
 * Encrypts data using AES-CBC with PKCS7 padding
 * @param data - Object or string to encrypt
 * @returns Encrypted string (Base64)
 */
export const encryptData = (data: unknown): string => {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY, {
    iv: INIT_VECTOR,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
};

/**
 * Decrypts AES-encrypted data
 * @param encryptedData - Encrypted string (Base64)
 * @returns Decrypted and parsed data
 */
export const decryptData = <T>(encryptedData: string): T => {
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY, {
    iv: INIT_VECTOR,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString) as T;
};

/**
 * Encrypts password for API transmission
 * Migrated from $rootScope.dataEncryption
 * @param password - Plain text password
 * @returns Encrypted password string
 */
export const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY, {
    iv: INIT_VECTOR,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
};

/**
 * Masks email for display (e.g., "j***n@g***l.com")
 * Migrated from maskEmail function in AppHomeController
 * @param email - Full email address
 * @returns Masked email string
 */
export const maskEmail = (email: string): string => {
  const parts = email.split('@');
  if (parts.length !== 2) return email;

  const name = parts[0];
  const domain = parts[1];

  const maskedName = name[0] + name.slice(1, -1).replace(/./g, '*') + name.slice(-1);

  const domainParts = domain.split('.');
  if (domainParts.length < 2) return maskedName + '@' + domain;

  const domainName = domainParts[0];
  const tld = domainParts.slice(1).join('.');
  const maskedDomain = domainName[0] + domainName.slice(1).replace(/./g, '*');

  return `${maskedName}@${maskedDomain}.${tld}`;
};

/**
 * Converts username to partial dots for display
 * Migrated from convertToPartialDots in AppHomeController
 * @param username - Full username/email
 * @returns Partially masked string
 */
export const convertToPartialDots = (username: string): string => {
  const length = username.length;
  let returnValue = '';
  const lastTwoPosition = length - 3;

  for (let index = 0; index < length; index++) {
    if (index < 2 || index > lastTwoPosition || username[index] === '@') {
      returnValue += username[index];
    } else {
      returnValue += '*';
    }
  }

  return returnValue;
};
