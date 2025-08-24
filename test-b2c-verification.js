// Test script pour l'API de vérification B2C
const testB2CVerification = async () => {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🧪 Test de l\'API de vérification B2C...\n');
    
    try {
        // Test 1: Envoyer un code de vérification
        console.log('1️⃣ Envoi du code de vérification...');
        const sendResponse = await fetch(`${baseUrl}/api/auth/b2c-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@company.com',
                action: 'send'
            }),
        });
        
        const sendData = await sendResponse.json();
        console.log('✅ Réponse envoi:', sendData);
        
        if (sendData.success) {
            // Test 2: Vérifier avec un code incorrect
            console.log('\n2️⃣ Test avec un code incorrect...');
            const wrongCodeResponse = await fetch(`${baseUrl}/api/auth/b2c-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@company.com',
                    action: 'verify',
                    verificationCode: '000000'
                }),
            });
            
            const wrongCodeData = await wrongCodeResponse.json();
            console.log('❌ Réponse code incorrect:', wrongCodeData);
            
            // Test 3: Vérifier avec le bon code (on ne peut pas le récupérer facilement en test)
            console.log('\n3️⃣ Note: Le code correct est affiché dans la console du serveur');
            console.log('   Pour tester la vérification, regardez la console du serveur Next.js');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
};

// Exécuter le test si le script est lancé directement
if (typeof window === 'undefined') {
    testB2CVerification();
}

module.exports = { testB2CVerification }; 