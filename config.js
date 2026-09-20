// Environment configuration (Switch this block when deploying to Staging vs Prod)
const ENV = "PROD"; // Production environment (family-allowance-hub)

const STAGING_CONFIG = {
    apiKey: "AIzaSyDv8DYJhOLSB1gjOehmmlpEuF05t4csqgI",
    authDomain: "family-allowance-staging.firebaseapp.com",
    projectId: "family-allowance-staging",
    storageBucket: "family-allowance-staging.firebasestorage.app",
    messagingSenderId: "410736187160",
    appId: "1:410736187160:web:abc5f2a0b8fd6ac342b06d"
  };

const PROD_CONFIG = {
  apiKey: "AIzaSyDyTTAZ9sQNHiioYInGDuiOjkWin0TjfIo",
  authDomain: "family-allowance-hub.firebaseapp.com",
  projectId: "family-allowance-hub",
  storageBucket: "family-allowance-hub.firebasestorage.app",
  messagingSenderId: "90520973036",
  appId: "1:90520973036:web:3b9b3cca2fe0c7c882ffc9"
};

const firebaseConfig = (ENV === "PROD") ? PROD_CONFIG : STAGING_CONFIG;