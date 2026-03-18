import Constants from 'expo-constants';

function inferBaseUrlFromExpoHost() {
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
    '';

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0];
  if (!host) {
    return null;
  }

  return `http://${host}:5000`;
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || inferBaseUrlFromExpoHost() || 'http://localhost:5000';
