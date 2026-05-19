'use strict';

/**
 * Web polyfill for expo-secure-store.
 * Uses localStorage as a fallback — not secure, but prevents crashes.
 */

function storageKey(key) {
  return `_nb_secure_store_${key}`;
}

export async function isAvailableAsync() {
  try {
    localStorage.setItem('__test__', 'test');
    localStorage.removeItem('__test__');
    return true;
  } catch {
    return false;
  }
}

export async function getItemAsync(key, _options) {
  return localStorage.getItem(storageKey(key));
}

export function getItem(key, _options) {
  return localStorage.getItem(storageKey(key));
}

export async function setItemAsync(key, value, _options) {
  if (typeof value !== 'string') {
    throw new Error('SecureStore values must be strings.');
  }
  localStorage.setItem(storageKey(key), value);
}

export function setItem(key, value, _options) {
  if (typeof value !== 'string') {
    throw new Error('SecureStore values must be strings.');
  }
  localStorage.setItem(storageKey(key), value);
}

export async function deleteItemAsync(key, _options) {
  localStorage.removeItem(storageKey(key));
}

export function canUseBiometricAuthentication() {
  return false;
}

export const AFTER_FIRST_UNLOCK = 0;
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 1;
export const ALWAYS = 2;
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 3;
export const ALWAYS_THIS_DEVICE_ONLY = 4;
export const WHEN_UNLOCKED = 5;
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = 6;
