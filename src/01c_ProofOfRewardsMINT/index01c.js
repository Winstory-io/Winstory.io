 // DOM Elements
 const walletElement = document.getElementById('wallet');
 const walletAddressElement = document.getElementById('wallet-address');
 const mintButton = document.getElementById('mint-button');
 const loadingSpinner = document.getElementById('loading-spinner');
 const checkmark = document.getElementById('checkmark');
 const standardCard = document.getElementById('standard-card');
 const premiumCard = document.getElementById('premium-card');
 const summaryContainer = document.getElementById('summary-container');
 const campaignSummary = document.getElementById('campaign-summary');
 const rewardModal = document.getElementById('rewardModal');
 const closeModal = document.querySelector('.close-modal');
 const cancelEdit = document.getElementById('cancel-edit');
 const saveEdit = document.getElementById('save-edit');
 
 // New elements for hover modals
 const standardInfoIcon = document.querySelector('.standard .info-icon');
 const premiumInfoIcon = document.querySelector('.premium .info-icon');
 const standardModal = document.getElementById('standardInfoModal');
 const premiumModal = document.getElementById('premiumInfoModal');
 const closeModalButtons = document.querySelectorAll('.close-info-modal');

 // Sample data structure (in a real app, this would come from your state management)
 const campaignData = {
     companyName: localStorage.getItem('companyName') || 'Your Company',
     standardRewards: JSON.parse(localStorage.getItem('standardRewards')) || [],
     premiumRewards: JSON.parse(localStorage.getItem('premiumRewards')) || [],
     netProfit: localStorage.getItem('netProfit') || '0',
     unitValue: localStorage.getItem('unitValue') || '0'
 };

 // Current reward being edited
 let currentReward = null;
 let currentRewardIndex = -1;
 let isPremium = false;

 // Display wallet address
 function displayWalletAddress() {
     const walletAddress = localStorage.getItem('walletAddress');
     if (walletAddress) {
         walletElement.style.display = 'flex';
         walletAddressElement.textContent = truncateAddress(walletAddress);
     }
 }

 // Truncate wallet address
 function truncateAddress(address) {
     return `${address.slice(0, 6)}...${address.slice(-4)}`;
 }

 // Get chain explorer URL
 function getExplorerUrl(chain, address) {
     const explorers = {
         'Ethereum': `https://etherscan.io/address/${address}`,
         'Polygon': `https://polygonscan.com/address/${address}`,
         'BNB Chain': `https://bscscan.com/address/${address}`,
         'Avalanche': `https://snowtrace.io/address/${address}`
     };
     return explorers[chain] || `https://etherscan.io/address/${address}`;
 }

 // Get chain logo
 function getChainLogo(chain) {
     const logos = {
         'Ethereum': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
         'Polygon': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
         'BNB Chain': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
         'Avalanche': 'https://cryptologos.cc/logos/avalanche-avax-logo.png'
     };
     return logos[chain] || 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
 }

 // Create reward item HTML
 function createRewardItem(reward, isPremium = false) {
     const accessTypeTag = reward.accessType ? `
         <span class="reward-access-type ${reward.accessType}">
             ${reward.accessType === 'digital' ? '🔑 Digital' : '📍 Physical'} Access
         </span>
     ` : '';

     return `
         <div class="reward-item" data-index="${reward.index}">
             <div class="reward-type">
                 <span class="reward-type-badge">${reward.type}</span>
                 ${accessTypeTag}
                 <span class="reward-verified ${reward.verified ? 'valid' : 'invalid'}">
                     ${reward.verified ? '✅ Verified by DAO' : '❌ Not verified'}
                 </span>
                 ${!reward.verified ? `
                     <div class="tooltip">
                         <span class="tooltiptext">This reward hasn't been verified by the DAO yet</span>
                     </div>
                 ` : ''}
             </div>
             <div class="reward-amount">Quantity: ${reward.quantity}</div>
             ${reward.media ? `
                 <div class="reward-media">
                     ${reward.media.type === 'image' ? 
                         `<img src="${reward.media.src}" alt="${reward.type} Preview">` : 
                         `<video src="${reward.media.src}" muted loop></video>`}
                     <div class="media-hover-effect">
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2">
                             <circle cx="12" cy="12" r="10"></circle>
                             <circle cx="12" cy="12" r="4"></circle>
                             <line x1="12" y1="8" x2="12" y2="12"></line>
                             <line x1="12" y1="16" x2="12" y2="16"></line>
                         </svg>
                     </div>
                 </div>
             ` : ''}
             ${reward.description ? `
                 <div class="reward-description">${reward.description}</div>
             ` : ''}
             ${reward.contract ? `
                 <div class="reward-contract">
                     <img src="${getChainLogo(reward.chain)}" alt="${reward.chain}" class="chain-logo">
                     <a href="${getExplorerUrl(reward.chain, reward.contract)}" target="_blank" rel="noopener noreferrer">
                         ${reward.contract}
                     </a>
                 </div>
             ` : ''}
         </div>
     `;
 }

 // Create summary item HTML
 function createSummaryItem(icon, text) {
     return `
         <div class="summary-item">
             <div class="summary-icon">${icon}</div>
             <div>${text}</div>
         </div>
     `;
 }

 // Load and display rewards data
 function loadRewardsData() {
     // Clear existing content
     standardCard.querySelectorAll('.reward-item').forEach(el => el.remove());
     premiumCard.querySelectorAll('.reward-item').forEach(el => el.remove());
     
     // Add index to rewards for editing
     campaignData.standardRewards.forEach((reward, index) => reward.index = index);
     campaignData.premiumRewards.forEach((reward, index) => reward.index = index);
     
     // Add standard rewards
     campaignData.standardRewards.forEach(reward => {
         standardCard.insertAdjacentHTML('beforeend', createRewardItem(reward));
     });
     
     // Add premium rewards
     campaignData.premiumRewards.forEach(reward => {
         premiumCard.insertAdjacentHTML('beforeend', createRewardItem(reward, true));
     });
     
     // Build campaign summary
     const standardCount = campaignData.standardRewards.length;
     const premiumCount = campaignData.premiumRewards.length;
     const standardTypes = [...new Set(campaignData.standardRewards.map(r => r.type))].join(', ');
     const premiumTypes = [...new Set(campaignData.premiumRewards.map(r => r.type))].join(', ');
     
     campaignSummary.innerHTML = `
         This campaign includes ${standardCount} standard rewards (${standardTypes}) 
         and ${premiumCount} premium rewards (${premiumTypes}). 
         Estimated total distribution if 100% completion: 
         ${standardCount + premiumCount} rewards.
     `;
     
     // Build mint summary
     let summaryHTML = '';
     
     if (campaignData.standardRewards.length > 0) {
         const standardText = campaignData.standardRewards
             .map(r => `${r.quantity} ${r.type}${r.quantity > 1 ? 's' : ''}`)
             .join(' + ');
         summaryHTML += createSummaryItem('✅', `<strong>Standard Rewards:</strong> ${standardText}`);
     }
     
     if (campaignData.premiumRewards.length > 0) {
         const premiumText = campaignData.premiumRewards
             .map(r => `${r.quantity} ${r.type}${r.quantity > 1 ? 's' : ''}`)
             .join(' + ');
         summaryHTML += createSummaryItem('✅', `<strong>Premium Rewards:</strong> ${premiumText}`);
     }
     
     summaryHTML += createSummaryItem('🎯', `<strong>Target Net Profit:</strong> $${campaignData.netProfit}`);
     summaryHTML += createSummaryItem('⛓️', `All data will be registered on-chain and can't be edited later.`);
     
     summaryContainer.insertAdjacentHTML('beforeend', summaryHTML);
 }

 // Open reward edit modal
 function openEditModal(reward, index, isPremiumReward) {
     currentReward = reward;
     currentRewardIndex = index;
     isPremium = isPremiumReward;
     
     // Fill modal with reward data
     document.getElementById('edit-reward-type').value = reward.type;
     document.getElementById('edit-reward-quantity').value = reward.quantity;
     
     // Show/hide access type based on reward type
     const accessTypeGroup = document.getElementById('access-type-group');
     if (reward.type === 'Exclusive Access') {
         accessTypeGroup.style.display = 'block';
         document.getElementById('edit-reward-access-type').value = reward.accessType || 'digital';
     } else {
         accessTypeGroup.style.display = 'none';
     }
     
     document.getElementById('edit-reward-chain').value = reward.chain || 'Ethereum';
     document.getElementById('edit-reward-contract').value = reward.contract || '';
     document.getElementById('edit-reward-description').value = reward.description || '';
     
     // Show modal
     rewardModal.style.display = 'block';
 }

 // Handle mint button click
 function handleMintClick() {
     // Show loading spinner
     mintButton.disabled = true;
     loadingSpinner.style.display = 'block';
     mintButton.querySelector('span').textContent = 'Signing...';

     // Simulate a transaction (in a real app, this would be a Web3 call)
     setTimeout(() => {
         loadingSpinner.style.display = 'none';
         checkmark.style.display = 'block';
         mintButton.querySelector('span').textContent = 'Transaction Complete!';

         // In a real app, you would handle the transaction result here
     }, 3000);
 }

 // Scroll animations
 function handleScrollAnimations() {
     const cardPosition = standardCard.getBoundingClientRect().top;
     const screenPosition = window.innerHeight / 1.3;

     if (cardPosition < screenPosition) {
         standardCard.classList.add('visible');
         premiumCard.classList.add('visible');
     }
 }

 // Initialize the page
 window.addEventListener('DOMContentLoaded', function() {
     displayWalletAddress();
     loadRewardsData();
     
     // Add scroll event listener for animations
     window.addEventListener('scroll', handleScrollAnimations);
     
     // Trigger once on load in case cards are already visible
     handleScrollAnimations();

     // Hover events for info modals
     standardInfoIcon.addEventListener('mouseenter', () => {
         standardModal.style.display = 'flex';
     });

     standardInfoIcon.addEventListener('mouseleave', () => {
         // Ne pas fermer si la souris est sur le modal
         if (!standardModal.matches(':hover')) {
             standardModal.style.display = 'none';
         }
     });

     standardModal.addEventListener('mouseleave', () => {
         standardModal.style.display = 'none';
     });

     // Même chose pour premium
     premiumInfoIcon.addEventListener('mouseenter', () => {
         premiumModal.style.display = 'flex';
     });

     premiumInfoIcon.addEventListener('mouseleave', () => {
         if (!premiumModal.matches(':hover')) {
             premiumModal.style.display = 'none';
         }
     });

     premiumModal.addEventListener('mouseleave', () => {
         premiumModal.style.display = 'none';
     });
 });

 // Mint button event listener
 mintButton.addEventListener('click', handleMintClick);

 // Reward card click handlers
 standardCard.addEventListener('click', function(e) {
     const rewardItem = e.target.closest('.reward-item');
     if (rewardItem) {
         const index = parseInt(rewardItem.dataset.index);
         openEditModal(campaignData.standardRewards[index], index, false);
     }
 });

 premiumCard.addEventListener('click', function(e) {
     const rewardItem = e.target.closest('.reward-item');
     if (rewardItem) {
         const index = parseInt(rewardItem.dataset.index);
         openEditModal(campaignData.premiumRewards[index], index, true);
     }
 });

 // Modal event listeners
 closeModal.addEventListener('click', function() {
     rewardModal.style.display = 'none';
 });

 cancelEdit.addEventListener('click', function() {
     rewardModal.style.display = 'none';
 });

 // Close info modals when clicking the close button
 closeModalButtons.forEach(button => {
     button.addEventListener('click', function(e) {
         e.stopPropagation();
         const modal = button.closest('.info-modal');
         modal.style.display = 'none';
     });
 });

 // Close modal when clicking outside
 window.addEventListener('click', function(e) {
     if (e.target === rewardModal) {
         rewardModal.style.display = 'none';
     }
     if (e.target.className === 'info-modal') {
         document.querySelectorAll('.info-modal').forEach(modal => {
             modal.style.display = 'none';
         });
     }
 });