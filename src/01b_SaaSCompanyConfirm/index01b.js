    // DOM Elements
    const walletElement = document.getElementById('wallet');
    const walletAddressElement = document.getElementById('wallet-address');
    const mintButton = document.getElementById('por-button');
    const infoModal = document.getElementById('infoModal');
    const acknowledgeCheckbox = document.getElementById('acknowledgeCheckbox');
    const continueButton = document.getElementById('continue-button');
    const infoIcon = document.getElementById('info-icon');
    const deleteButton = document.getElementById('delete-button');
    const deletePopup = document.getElementById('deletePopup');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const closeDeletePopup = document.querySelector('.close-delete-popup');
    const overlay = document.getElementById('overlay');
    const expandedCard = document.getElementById('expanded-card');
    const expandedCardTitle = document.getElementById('expanded-card-title');
    const expandedCardTextarea = document.getElementById('expanded-card-textarea');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');

    // Current editable field
    let currentEditableField = null;
    let currentFieldId = null;

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

    // Load campaign data from localStorage
    function loadCampaignData() {
        // Retrieve all data from localStorage
        const campaignData = {
            companyName: localStorage.getItem('companyName'),
            professionalEmail: localStorage.getItem('professionalEmail'),
            activitySector: localStorage.getItem('activitySector'),
            title: localStorage.getItem('title'),
            startingText: localStorage.getItem('startingText'),
            guideline: localStorage.getItem('guideline'),
            unitValue: localStorage.getItem('unitValue'),
            netProfit: localStorage.getItem('netProfit'),
            maxMint: localStorage.getItem('maxMint'),
            videoUrl: localStorage.getItem('videoUrl'),
            standardReward: localStorage.getItem('standardReward'),
            premiumReward: localStorage.getItem('premiumReward')
        };

        // Update the UI with the retrieved data
        document.getElementById('company-name').textContent = campaignData.companyName || '';
        document.getElementById('professional-email').textContent = campaignData.professionalEmail || '';
        document.getElementById('activity-sector').textContent = campaignData.activitySector || '';
        document.getElementById('title').textContent = campaignData.title || '';
        document.getElementById('starting-text').textContent = campaignData.startingText || '';
        document.getElementById('guideline').textContent = campaignData.guideline || '';
        document.getElementById('unit-value').textContent = campaignData.unitValue ? `${campaignData.unitValue} WINC` : '';
        document.getElementById('net-profit').textContent = campaignData.netProfit ? `${campaignData.netProfit} WINC` : '';
        document.getElementById('max-mint').textContent = campaignData.maxMint ? `${campaignData.maxMint} WINC` : '';

        // Handle video display
        const videoElement = document.getElementById('uploaded-video');
        const noVideoElement = document.getElementById('no-video');

        if (campaignData.videoUrl) {
            videoElement.src = campaignData.videoUrl;
            videoElement.style.display = 'block';
            noVideoElement.style.display = 'none';
        } else {
            videoElement.style.display = 'none';
            noVideoElement.style.display = 'block';
        }

        // Check if all required data is present
        checkRequiredData();

        // Setup editable fields
        setupEditableFields();
    }

    // Setup editable fields
    function setupEditableFields() {
        const editableFields = document.querySelectorAll('.editable');

        editableFields.forEach(field => {
            field.addEventListener('click', function() {
                const fieldId = this.id;
                const fieldValue = this.textContent.trim().replace('✏️', '');
                const fieldLabel = this.parentElement.querySelector('strong').textContent;
                const cardTitle = this.closest('.info-card').querySelector('h2').textContent;

                currentEditableField = this;
                currentFieldId = fieldId;

                expandedCardTitle.textContent = `${cardTitle} - ${fieldLabel}`;
                expandedCardTextarea.value = fieldValue;

                overlay.style.display = 'block';
                expandedCard.style.display = 'block';
            });
        });
    }

    // Check if all required data is present
    function checkRequiredData() {
        const requiredFields = [
            'companyName',
            'professionalEmail',
            'title',
            'startingText',
            'standardReward',
            'premiumReward'
        ];

        let allFieldsPresent = true;

        for (const field of requiredFields) {
            if (!localStorage.getItem(field)) {
                allFieldsPresent = false;
                break;
            }
        }

        if (allFieldsPresent) {
            mintButton.disabled = false;
        }
    }

    // Show modal on load
    function showInfoModal() {
        infoModal.style.display = 'block';
    }

    // Close modal and accept terms
    function acceptTerms() {
        localStorage.setItem('mintTermsAccepted', 'true');
        infoModal.style.display = 'none';
    }

    // Initialize MINT process
    function initMint() {
        // Here you would typically:
        // 1. Connect to the user's wallet
        // 2. Prepare the transaction
        // 3. Send the transaction
        // 4. Handle the response

        alert('MINT transaction will be initiated. In a real implementation, this would connect to Web3 and sign the transaction.');
    }

    // Restart the process
    function restartProcess() {
        deletePopup.style.display = 'none';

        // Clear all relevant localStorage items
        const keysToRemove = [
            'companyName',
            'professionalEmail',
            'activitySector',
            'title',
            'startingText',
            'guideline',
            'unitValue',
            'netProfit',
            'maxMint',
            'videoUrl',
            'standardReward',
            'premiumReward',
            'mintTermsAccepted'
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        // Redirect to SaaS Company page
        window.location.href = 'saas-company.html';
    }

    // Save edited field
    function saveEditedField() {
        if (currentEditableField && currentFieldId) {
            const newValue = expandedCardTextarea.value;
            currentEditableField.textContent = newValue + ' ✏️';
            localStorage.setItem(currentFieldId, newValue);

            overlay.style.display = 'none';
            expandedCard.style.display = 'none';

            checkRequiredData();
        }
    }

    // Close expanded card
    function closeExpandedCard() {
        overlay.style.display = 'none';
        expandedCard.style.display = 'none';
    }

    // Event Listeners
    acknowledgeCheckbox.addEventListener('change', function() {
        continueButton.disabled = !this.checked;
    });

    continueButton.addEventListener('click', acceptTerms);

    infoIcon.addEventListener('click', function() {
        infoModal.style.display = 'block';
    });

    deleteButton.addEventListener('click', function() {
        deletePopup.style.display = 'block';
    });

    confirmDeleteBtn.addEventListener('click', restartProcess);

    cancelDeleteBtn.addEventListener('click', function() {
        deletePopup.style.display = 'none';
    });

    closeDeletePopup.addEventListener('click', function() {
        deletePopup.style.display = 'none';
    });

    mintButton.addEventListener('click', initMint);

    saveButton.addEventListener('click', saveEditedField);

    cancelButton.addEventListener('click', closeExpandedCard);

    overlay.addEventListener('click', closeExpandedCard);

    // Initialize the page
    window.addEventListener('DOMContentLoaded', function() {
        displayWalletAddress();
        loadCampaignData();
        showInfoModal(); // Always show modal on load
    });