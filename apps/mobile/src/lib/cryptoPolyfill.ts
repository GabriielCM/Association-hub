import * as ExpoCrypto from 'expo-crypto';

// Polyfill crypto.getRandomValues for TweetNaCl in React Native/Hermes
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = {};
}
if (typeof global.crypto.getRandomValues === 'undefined') {
  (global as any).crypto.getRandomValues = ExpoCrypto.getRandomValues;
}
