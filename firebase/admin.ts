import * as admin from "firebase-admin";

const getPrivateKey = () => {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;

  // Jika kunci mengandung header PEM langsung, gunakan replace \n
  if (key.includes("BEGIN PRIVATE KEY")) {
    return key.replace(/\\n/g, "\n");
  }

  // Jika tidak, asumsikan ini adalah Base64 (untuk menghindari masalah karakter spesial di CI/CD)
  try {
    const decoded = Buffer.from(key, 'base64').toString('utf8');
    if (decoded.includes("BEGIN PRIVATE KEY")) {
      return decoded.replace(/\\n/g, "\n");
    }
  } catch (e) {
    console.error("Failed to decode FIREBASE_PRIVATE_KEY from Base64");
  }

  // Fallback ke perilaku lama
  return key.replace(/\\n/g, "\n");
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
  });
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
