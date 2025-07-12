// Configuration Pinata API
// Obtenez vos clés sur https://app.pinata.cloud/

export const PINATA_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY || "e84206f813ab133b6e93",
  API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET || "791d5cafd5fd4cb46f2b007de83936eef6cd5a65b73d8e828938d6a5a9151d94",
  BASE_URL: "https://api.pinata.cloud",
  GATEWAY_URL: "https://gateway.pinata.cloud/ipfs"
};

// Fonction pour vérifier si les clés API sont valides
export const validatePinataKeys = () => {
  const apiKey = PINATA_CONFIG.API_KEY;
  const apiSecret = PINATA_CONFIG.API_SECRET;
  
  // Vérifier si les clés ne sont pas les clés par défaut
  if (apiKey === "e84206f813ab133b6e93" || apiSecret === "791d5cafd5fd4cb46f2b007de83936eef6cd5a65b73d8e828938d6a5a9151d94") {
    console.warn("⚠️ Using default Pinata API keys. Please set your own keys in .env.local");
    return false;
  }
  
  return true;
}; 