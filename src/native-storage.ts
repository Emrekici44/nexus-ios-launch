import * as SecureStore from 'expo-secure-store';

export async function readBoolean(key: string, fallback: boolean) {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value === null) return fallback;
    return value === 'true';
  } catch {
    return fallback;
  }
}

export async function writeBoolean(key: string, value: boolean) {
  await SecureStore.setItemAsync(key, String(value));
}

export async function readText(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function writeText(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}
