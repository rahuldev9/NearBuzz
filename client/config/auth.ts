const defaultUserKey = "NEARBUZZ_USER";
const defaultAccessTokenKey = "NEARBUZZ_ACCESS_TOKEN";
const defaultRefreshTokenKey = "NEARBUZZ_REFRESH_TOKEN";

// Expo/React Native public env vars must be prefixed with EXPO_PUBLIC_
export const KEY_USER = process.env.EXPO_PUBLIC_KEY_USER || defaultUserKey;
export const KEY_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_KEY_ACCESS_TOKEN || defaultAccessTokenKey;
export const KEY_REFRESH_TOKEN =
  process.env.EXPO_PUBLIC_KEY_REFRESH_TOKEN || defaultRefreshTokenKey;

export default {
  KEY_USER,
  KEY_ACCESS_TOKEN,
  KEY_REFRESH_TOKEN,
};
