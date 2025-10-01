const fs = require('fs');

// Lire le fichier
const filePath = 'app/creation/individual/recap/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Ajouter l'import du composant de paiement
const importLine = 'import ThirdwebPayment from "@/components/ThirdwebPayment";';
const existingImports = content.match(/import.*from.*react.*;/g);
if (existingImports && !content.includes('ThirdwebPayment')) {
  const lastImportIndex = content.lastIndexOf(existingImports[existingImports.length - 1]);
  const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
  content = content.slice(0, insertIndex) + importLine + '\n' + content.slice(insertIndex);
}

// Ajouter l'état pour le paiement
const stateLine = '  const [showPayment, setShowPayment] = useState(false);';
const existingState = content.match(/const \[.*useState.*\]/g);
if (existingState && !content.includes('showPayment')) {
  const lastStateIndex = content.lastIndexOf(existingState[existingState.length - 1]);
  const insertIndex = content.indexOf('\n', lastStateIndex) + 1;
  content = content.slice(0, insertIndex) + stateLine + '\n' + content.slice(insertIndex);
}

// Modifier la fonction handleConfirm
const oldHandleConfirm = `  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      // TODO: Rediriger vers le processus de MINT
      console.log("Redirecting to minting process...");
      // router.push("/creation/individual/mint");
    }, 1000);
  };`;

const newHandleConfirm = `  const handleConfirm = () => {
    setConfirmed(true);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (transactionHash: string) => {
    console.log("Payment successful:", transactionHash);
    // TODO: Créer la campagne dans la base de données
    // TODO: Rediriger vers la page de succès
    setTimeout(() => {
      router.push("/creation/individual/mint");
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    setConfirmed(false);
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setConfirmed(false);
    setShowPayment(false);
  };`;

content = content.replace(oldHandleConfirm, newHandleConfirm);

// Ajouter le composant de paiement dans le JSX
const paymentComponent = `        {/* Composant de paiement */}
        {showPayment && economicData && (
          <ThirdwebPayment
            mintAmount={economicData.mint}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        )}`;

// Trouver l'endroit où ajouter le composant (juste avant la fermeture du div principal)
const mainDivEnd = content.lastIndexOf('      </div>');
if (mainDivEnd !== -1) {
  content = content.slice(0, mainDivEnd) + paymentComponent + '\n' + content.slice(mainDivEnd);
}

// Écrire le fichier modifié
fs.writeFileSync(filePath, content);
console.log('Fichier modifié avec succès');
