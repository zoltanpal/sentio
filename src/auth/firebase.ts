import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Public Firebase WEB configuration only. Never put an Admin private key here.
export function getFirebaseAuth() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value)) {
    throw new Error("Firebase configuration is missing. Add the VITE_FIREBASE values to .env.local and restart Vite.");
  }
  return getAuth(getApps().length ? getApp() : initializeApp(config));
}
