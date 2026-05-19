'use strict';

/**
 * Web polyfill for expo-haptics.
 * Uses Vibration API where available, no-op otherwise.
 */

export const NotificationFeedbackType = {
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
};

export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
  Soft: 'soft',
  Rigid: 'rigid',
};

function canVibrate() {
  return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
}

export async function selectionAsync() {
  if (canVibrate()) navigator.vibrate(50);
}

export async function notificationAsync(_type) {
  if (canVibrate()) navigator.vibrate(50);
}

export async function impactAsync(_style) {
  if (canVibrate()) navigator.vibrate(50);
}
