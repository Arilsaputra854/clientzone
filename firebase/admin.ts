import * as admin from "firebase-admin";

const getPrivateKey = () => {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!rawKey) return undefined;

  let key = rawKey;

  // 1. Cek jika key dalam format Base64
  if (!key.includes("BEGIN PRIVATE KEY") && !key.startsWith("{")) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      key = decoded;
    } catch (e) {
      console.error("FIREBASE_PRIVATE_KEY is not a valid Base64 string");
    }
  }

  // 2. Cek jika key ternyata adalah seluruh isi JSON service account (baik hasil decode base64 atau bukan)
  if (key.trim().startsWith("{")) {
    try {
      const json = JSON.parse(key);
      if (json.private_key) {
        key = json.private_key;
      }
    } catch (e) {
      // Bukan JSON valid, lanjut ke pemrosesan string biasa
    }
  }

  // 3. Bersihkan karakter \n literal (\\n) menjadi newline asli (\n)
  key = key.replace(/\\n/g, "\n");

  // 4. Pastikan tidak ada kutipan ganda pembungkus
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.substring(1, key.length - 1);
  }

  // 5. Trim whitespace
  key = key.trim();

  // 6. Validasi akhir: Harus ada header PEM
  if (!key.includes("BEGIN PRIVATE KEY")) {
    console.error("FIREBASE_PRIVATE_KEY does not contain BEGIN PRIVATE KEY header");
  }

  return key;
};

if (!admin.apps.length) {
  try {
    const certConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    };

    admin.initializeApp({
      credential: admin.credential.cert(certConfig),
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error);
  }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
