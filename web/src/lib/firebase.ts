import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getFirebaseConfig } from '../config/env'

const firebaseConfig = getFirebaseConfig()

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)
