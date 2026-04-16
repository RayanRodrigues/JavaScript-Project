import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBTVMwizMfqwb9rxzSaaXawtJDdGSl-Bac',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'javascript-project-af405.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'javascript-project-af405',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'javascript-project-af405.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '512010067327',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ?? '1:512010067327:web:a5500f9b244f6c49d4ce4a',
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)
