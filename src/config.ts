export const NEXUS_URL = 'https://nexus.ekici-emre.chatgpt.site/';
export const NEXUS_ORIGIN = new URL(NEXUS_URL).origin;
export const VERSION_URL = `${NEXUS_ORIGIN}/api/version`;
export const CURRENT_WEB_VERSION = '148';

export const STORAGE_KEYS = {
  faceIdEnabled: 'nexus.native.faceIdEnabled',
  lastWebRelease: 'nexus.native.lastWebRelease',
} as const;
