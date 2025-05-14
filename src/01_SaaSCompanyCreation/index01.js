document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const DOM = {
        // Header & Modals
        searchIcon: document.getElementById('search-icon'),
        searchModal: document.getElementById('search-modal'),

        // Video Upload
        videoUpload: document.getElementById('video-upload'),
        videoPreview: document.getElementById('video-preview'),
        videoContainer: document.getElementById('video-container'),
        videoUploadSection: document.getElementById('video-upload-section'),
        winstoryFilmCheckbox: document.getElementById('winstory-film'),

        // Reward Parameters
        unitValueInput: document.getElementById('unit-value'),
        freeRewardCheckbox: document.getElementById('free-reward'),
        netProfitInput: document.getElementById('net-profit'),
        selectedUnitValue: document.getElementById('selected-unit-value'),
        selectedNetProfit: document.getElementById('selected-net-profit'),
        maximumMint: document.getElementById('maximum-mint'),
        totalRevenue: document.getElementById('total-revenue'),
        initialMintPrice: document.getElementById('initial-mint-price'),

        // Tooltip Elements
        rewardsTooltip: document.getElementById('rewards-tooltip'),
        rewardsTooltipPopup: document.getElementById('rewards-tooltip-popup'),
        tooltipOverlay: document.getElementById('tooltip-overlay'),
        closeTooltipBtn: document.getElementById('close-tooltip'),

        // Reward Types
        standardRewardType: document.getElementById('standard-reward-type'),
        premiumRewardType: document.getElementById('premium-reward-type'),
        standardRewardDetails: document.getElementById('standard-reward-details'),
        premiumRewardDetails: document.getElementById('premium-reward-details'),

        // Free Reward Elements
        zeroValuePopup: document.getElementById('zero-value-popup'),
        closePopupBtn: document.getElementById('close-popup'),
        okPopupBtn: document.getElementById('ok-popup'),
        maxMintsContainer: document.getElementById('max-mints-container'),
        maxMintsInput: document.getElementById('max-mints'),
    };

    // State
    const state = {
        isFreeReward: false,
        rewardData: {
            standard: {
                type: '',
                tokensPerMinter: 0,
                tokenName: '',
                itemsPerMinter: 0,
                itemName: ''
            },
            premium: {
                type: '',
                tokensPerMinter: 0,
                tokenName: '',
                itemsPerMinter: 0,
                itemName: ''
            }
        }
    };

    // Initialize
    function init() {
        setupEventListeners();
        updateCalculations();
        updateRewardDetails();
        updateInitialMintPrice();
    }

    // Event Listeners
    function setupEventListeners() {
        // Search functionality
        DOM.searchIcon.addEventListener('click', () => DOM.searchModal.style.display = 'flex');
        DOM.searchModal.addEventListener('click', (e) => {
            if (e.target === DOM.searchModal) {
                DOM.searchModal.style.display = 'none';
            }
        });

        // Video upload
        DOM.videoUpload.addEventListener('change', handleVideoUpload);
        DOM.winstoryFilmCheckbox.addEventListener('change', toggleWinstoryFilmOption);

        // Reward parameters
        DOM.freeRewardCheckbox.addEventListener('change', handleFreeRewardChange);
        DOM.unitValueInput.addEventListener('input', function() {
            updateCalculations();
            updateRewardCalculations();
        });
        DOM.netProfitInput.addEventListener('input', function() {
            updateCalculations();
            updateRewardCalculations();
        });
        DOM.maxMintsInput.addEventListener('input', updateFreeRewardCalculations);

        // Check for zero values
        DOM.unitValueInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                checkForZeroValues();
            }
        });
        DOM.unitValueInput.addEventListener('blur', checkForZeroValues);

        // Reward types
        DOM.standardRewardType.addEventListener('change', updateRewardDetails);
        DOM.premiumRewardType.addEventListener('change', updateRewardDetails);

        // Zero value popup
        DOM.closePopupBtn.addEventListener('click', closeZeroValuePopup);
        DOM.okPopupBtn.addEventListener('click', closeZeroValuePopup);

        // Tooltip functionality
        DOM.rewardsTooltip.addEventListener('click', openTooltip);
        DOM.closeTooltipBtn.addEventListener('click', closeTooltip);
        DOM.tooltipOverlay.addEventListener('click', closeTooltip);
    }

    // Tooltip functions
    function openTooltip() {
        DOM.rewardsTooltipPopup.style.display = 'block';
        DOM.tooltipOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeTooltip() {
        DOM.rewardsTooltipPopup.style.display = 'none';
        DOM.tooltipOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Close with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && DOM.rewardsTooltipPopup.style.display === 'block') {
            closeTooltip();
        }
    });

    // Video Upload Handler
    function handleVideoUpload() {
        const file = this.files[0];
        const videoPlaceholder = document.querySelector('.video-placeholder');
        
        if (file) {
            const videoURL = URL.createObjectURL(file);
            DOM.videoPreview.src = videoURL;
            videoPlaceholder.style.display = 'none';
            
            // Detect video orientation
            DOM.videoPreview.onloadedmetadata = function() {
                if (this.videoWidth < this.videoHeight) {
                    DOM.videoContainer.classList.add('vertical');
                } else {
                    DOM.videoContainer.classList.remove('vertical');
                }
            };
        } else {
            DOM.videoPreview.src = '';
            videoPlaceholder.style.display = 'flex';
            DOM.videoContainer.classList.remove('vertical');
        }
    }

    // Toggle Winstory film option
    function toggleWinstoryFilmOption() {
        if (this.checked) {
            DOM.videoContainer.style.display = 'none';
            DOM.videoUpload.style.display = 'none';
            const helperText = DOM.videoUpload.nextElementSibling;
            if (helperText) {
                helperText.style.display = 'none';
            }
        } else {
            DOM.videoContainer.style.display = 'block';
            DOM.videoUpload.style.display = 'block';
            const helperText = DOM.videoUpload.nextElementSibling;
            if (helperText) {
                helperText.style.display = 'block';
            }
        }
        updateInitialMintPrice();
        updateCalculations();
    }

    // Check for zero values
    function checkForZeroValues() {
        const unitValue = parseFloat(DOM.unitValueInput.value) || 0;
        
        if (unitValue === 0) {
            DOM.freeRewardCheckbox.checked = true;
            handleFreeRewardChange();
        }
    }

    // Free Reward Toggle
    function handleFreeRewardChange() {
        state.isFreeReward = DOM.freeRewardCheckbox.checked;

        if (state.isFreeReward) {
            showZeroValuePopup();
            DOM.unitValueInput.value = '0.00';
            DOM.unitValueInput.disabled = true;
            DOM.netProfitInput.value = '0';
            DOM.netProfitInput.disabled = true;

            // Apply greyed out style
            document.querySelector('p:has(#selected-unit-value)').classList.add('free-reward-disabled');
            document.querySelector('p:has(#selected-net-profit)').classList.add('free-reward-disabled');
            document.querySelector('p:has(#total-revenue)').classList.add('free-reward-disabled');
            document.querySelector('p:has(#unit-value)').classList.add('free-reward-disabled');
            document.querySelector('p:has(#net-profit)').classList.add('free-reward-disabled');

            // Show max mints input
            DOM.maxMintsContainer.style.display = 'block';
        } else {
            DOM.unitValueInput.value = '1.00';
            DOM.unitValueInput.disabled = false;
            DOM.netProfitInput.value = '1000';
            DOM.netProfitInput.disabled = false;
            DOM.maxMintsContainer.style.display = 'none';

            // Remove greyed out style
            document.querySelector('p:has(#selected-unit-value)').classList.remove('free-reward-disabled');
            document.querySelector('p:has(#selected-net-profit)').classList.remove('free-reward-disabled');
            document.querySelector('p:has(#total-revenue)').classList.remove('free-reward-disabled');
            document.querySelector('p:has(#unit-value)').classList.remove('free-reward-disabled');
            document.querySelector('p:has(#net-profit)').classList.remove('free-reward-disabled');
        }

        updateCalculations();
        updateRewardCalculations();
    }

    // Show Zero Value Popup
    function showZeroValuePopup() {
        DOM.zeroValuePopup.style.display = 'block';
    }

    // Close Zero Value Popup
    function closeZeroValuePopup() {
        DOM.zeroValuePopup.style.display = 'none';
        DOM.maxMintsContainer.style.display = 'block';
        updateFreeRewardCalculations();
    }

    // Update Calculations
    function updateCalculations() {
        const unitValue = parseFloat(DOM.unitValueInput.value) || 0;
        const netProfit = parseFloat(DOM.netProfitInput.value) || 0;
        const winstoryFilmChecked = DOM.winstoryFilmCheckbox.checked;

        // Update displayed values
        DOM.selectedUnitValue.textContent = unitValue.toFixed(2);
        DOM.selectedNetProfit.textContent = netProfit.toFixed(2);

        if (state.isFreeReward) {
            updateFreeRewardCalculations();
        } else {
            // Calculate maximum mints and total revenue for paid rewards
            let maximumMint;
            if (winstoryFilmChecked) {
                maximumMint = Math.ceil((1500 + netProfit) / (unitValue * 0.5));
            } else {
                maximumMint = Math.ceil((1000 + netProfit) / (unitValue * 0.5));
            }
            
            // Ensure minimum of 5
            if (maximumMint < 5) {
                maximumMint = 5;
                // Show info message
                const mintInfo = document.createElement('div');
                mintInfo.style.color = '#FFD700';
                mintInfo.style.marginTop = '10px';
                mintInfo.style.fontSize = '0.9em';
                mintInfo.textContent = 'To ensure consistency and fair ranking across all campaigns, a minimum of 5 completions is required. This baseline has been automatically set.';
                DOM.maximumMint.parentNode.appendChild(mintInfo);
                if (!document.getElementById('mint-info-message')) {
                    mintInfo.id = 'mint-info-message';
                    DOM.maximumMint.parentNode.appendChild(mintInfo);
                }
            } else {
                // Remove message if exists
                const existingMessage = document.getElementById('mint-info-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
            }

            const totalRevenue = netProfit + 1000 + (winstoryFilmChecked ? 500 : 0);

            DOM.maximumMint.textContent = maximumMint;
            DOM.totalRevenue.textContent = totalRevenue.toFixed(2);
        }

        updateRewardCalculations();
    }

    // Update Free Reward Calculations
    function updateFreeRewardCalculations() {
        const maxMints = parseInt(DOM.maxMintsInput.value) || 100;
        DOM.maximumMint.textContent = maxMints;
        DOM.totalRevenue.textContent = '0.00';
        updateRewardCalculations();
    }

    function updateInitialMintPrice() {
        const winstoryFilmChecked = DOM.winstoryFilmCheckbox.checked;
        DOM.initialMintPrice.textContent = winstoryFilmChecked ? '1500' : '1000';
        
        if (!state.isFreeReward) {
            const netProfit = parseFloat(DOM.netProfitInput.value) || 0;
            DOM.totalRevenue.textContent = (netProfit + 1000 + (winstoryFilmChecked ? 500 : 0)).toFixed(2);
        }
    }

    // Update Reward Details
    function updateRewardDetails() {
        // Update standard reward
        state.rewardData.standard.type = DOM.standardRewardType.value;
        updateStandardRewardDetails();

        // Update premium reward
        state.rewardData.premium.type = DOM.premiumRewardType.value;
        updatePremiumRewardDetails();

        // Setup dynamic event listeners for new inputs
        setupDynamicEventListeners();
        
        updateRewardCalculations();
    }

    // Update Standard Reward Details
    function updateStandardRewardDetails() {
        let details = '';

        switch (state.rewardData.standard.type) {
            case 'digital-tokens':
                const stdTokens = state.rewardData.standard.tokensPerMinter || 0;
                const stdTotalTokens = stdTokens * parseInt(DOM.maximumMint.textContent);
                details = `
            <label for="standard-token-name">Name of the token ?</label>
            <input type="text" id="standard-token-name" name="standard-token-name"
                   value="${state.rewardData.standard.tokenName || ''}">

            <label for="standard-tokens-per-minter">HOW MANY TOKENS PER INDIVIDUAL COMMUNITY MINTER VALIDATED ?</label>
            <input type="number" id="standard-tokens-per-minter" name="standard-tokens-per-minter" step="0.00001"
                   value="${stdTokens}">

            <p style="color: white;">SEND WITH YOUR ADDRESS CURRENTLY CONNECTED TO WINSTORY.IO
                <span id="standard-total-tokens" class="highlight-yellow">${stdTotalTokens}</span> TOKENS
                <span id="standard-token-name-display" class="highlight-yellow">${state.rewardData.standard.tokenName || ''}</span> TO OUR WINSTORY ADDRESS
            </p>
        `;
        break;

    case 'digital-exclusive-items':
        const stdItems = parseFloat(state.rewardData.standard.itemsPerMinter) || 0;
        const stdTotalItems = (stdItems * parseFloat(DOM.maximumMint.textContent)).toFixed(5);
        details = `
            <label for="standard-item-name">Name of the item ?</label>
            <input type="text" id="standard-item-name" name="standard-item-name"
                   value="${state.rewardData.standard.itemName || ''}">

            <label for="standard-items-per-minter">HOW MANY ITEM(S) PER INDIVIDUAL COMMUNITY MINTER VALIDATED ?</label>
            <input type="number" id="standard-items-per-minter" name="standard-items-per-minter" step="0.00001"
                   value="${stdItems}">

            <p style="color: white;">SEND WITH YOUR ADDRESS CURRENTLY CONNECTED TO WINSTORY.IO
                <span id="standard-total-items" class="highlight-yellow">${stdTotalItems}</span> ITEMS
                <span id="standard-item-name-display" class="highlight-yellow">${state.rewardData.standard.itemName || ''}</span> TO OUR WINSTORY ADDRESS
            </p>
        `;
        break;

            case 'digital-exclusive-access':
            case 'physical-exclusive-event-access':
                details = `
                    <p style="color: white;">SEND WITH YOUR ADDRESS CURRENTLY CONNECTED TO WINSTORY.IO 1 EVENT ACCESS NFT TO OUR WINSTORY ADDRESS</p>
                    <p style="color: white;">We will duplicate to <span id="standard-total-community-validated-minters" class="highlight-yellow">${DOM.maximumMint.textContent}</span> Community Validated Minters</p>
                `;
                break;

            default:
                details = '';
        }

        DOM.standardRewardDetails.innerHTML = details;
    }

    // Update Premium Reward Details
    function updatePremiumRewardDetails() {
        let details = '';

        switch (state.rewardData.premium.type) {
            case 'digital-tokens':
                const premTokens = state.rewardData.premium.tokensPerMinter || 0;
                details = `
            <label for="premium-token-name">Name of the token ?</label>
            <input type="text" id="premium-token-name" name="premium-token-name"
                   value="${state.rewardData.premium.tokenName || ''}">

            <label for="premium-tokens-per-minter">HOW MANY TOKENS PER INDIVIDUAL COMMUNITY MINTER VALIDATED ?</label>
            <input type="number" id="premium-tokens-per-minter" name="premium-tokens-per-minter" step="0.00001"
                   value="${premTokens}">

            <p style="color: white;">SEND WITH YOUR ADDRESS CURRENTLY CONNECTED TO WINSTORY.IO
                <span id="premium-total-tokens" class="highlight-yellow">${premTotalTokens}</span> TOKENS
                <span id="premium-token-name-display" class="highlight-yellow">${state.rewardData.premium.tokenName || ''}</span> TO OUR WINSTORY ADDRESS
            </p>
        `;
        break;

    case 'digital-exclusive-items':
        const premItems = parseFloat(state.rewardData.premium.itemsPerMinter) || 0;
        const premTotalItems = (3 * premItems).toFixed(5);
        details = `
            <label for="premium-item-name">Name of the item ?</label>
            <input type="text" id="premium-item-name" name="premium-item-name"
                   value="${state.rewardData.premium.itemName || ''}">

            <label for="premium-items-per-minter">HOW MANY ITEM(S) PER INDIVIDUAL COMMUNITY MINTER VALIDATED ?</label>
            <input type="number" id="premium-items-per-minter" name="premium-items-per-minter" step="0.00001"
                   value="${premItems}">

            <p style="color: white;">SEND WITH YOUR ADDRESS CURRENTLY CONNECTED TO WINSTORY.IO
                <span id="premium-total-items" class="highlight-yellow">${premTotalItems}</span> ITEMS
                <span id="premium-item-name-display" class="highlight-yellow">${state.rewardData.premium.itemName || ''}</span> TO OUR WINSTORY ADDRESS
            </p>
        `;
        break;

            case 'digital-exclusive-access':
            case 'physical-exclusive-event-access':
                details = `
                    <p style="color: white;">SEND WITH YOUR ADDRESS CURRENTLY CONNECTED TO WINSTORY.IO 1 EVENT ACCESS NFT TO OUR WINSTORY ADDRESS</p>
                    <p style="color: white;">We will duplicate to <span id="premium-total-community-validated-minters" class="highlight-yellow">${DOM.maximumMint.textContent}</span> Premium Community Validated Minters</p>
                `;
                break;

            default:
                details = '';
        }

        DOM.premiumRewardDetails.innerHTML = details;
    }

   // Modifications pour Setup Dynamic Event Listeners
function setupDynamicEventListeners() {
// Standard Reward Listeners
document.getElementById('standard-token-name')?.addEventListener('input', function() {
    state.rewardData.standard.tokenName = this.value;
    document.getElementById('standard-token-name-display').textContent = this.value;
});

document.getElementById('standard-tokens-per-minter')?.addEventListener('input', function() {
    state.rewardData.standard.tokensPerMinter = parseFloat(this.value) || 0;
    const total = (state.rewardData.standard.tokensPerMinter * parseFloat(DOM.maximumMint.textContent)).toFixed(5);
    document.getElementById('standard-total-tokens').textContent = total;
});

document.getElementById('standard-item-name')?.addEventListener('input', function() {
    state.rewardData.standard.itemName = this.value;
    document.getElementById('standard-item-name-display').textContent = this.value;
});

document.getElementById('standard-items-per-minter')?.addEventListener('input', function() {
    state.rewardData.standard.itemsPerMinter = parseFloat(this.value) || 0;
    const total = (state.rewardData.standard.itemsPerMinter * parseFloat(DOM.maximumMint.textContent)).toFixed(5);
    document.getElementById('standard-total-items').textContent = total;
});

// Premium Reward Listeners
document.getElementById('premium-token-name')?.addEventListener('input', function() {
    state.rewardData.premium.tokenName = this.value;
    document.getElementById('premium-token-name-display').textContent = this.value;
});

document.getElementById('premium-tokens-per-minter')?.addEventListener('input', function() {
    state.rewardData.premium.tokensPerMinter = parseFloat(this.value) || 0;
    const total = (3 * state.rewardData.premium.tokensPerMinter).toFixed(5);
    document.getElementById('premium-total-tokens').textContent = total;
});

document.getElementById('premium-item-name')?.addEventListener('input', function() {
    state.rewardData.premium.itemName = this.value;
    document.getElementById('premium-item-name-display').textContent = this.value;
});

document.getElementById('premium-items-per-minter')?.addEventListener('input', function() {
    state.rewardData.premium.itemsPerMinter = parseFloat(this.value) || 0;
    const total = (3 * state.rewardData.premium.itemsPerMinter).toFixed(5);
    document.getElementById('premium-total-items').textContent = total;
});
}

    // Modifications pour Update Reward Calculations
function updateRewardCalculations() {
// Update validator counts
const mints = DOM.maximumMint.textContent;
document.querySelectorAll('#standard-total-community-validated-minters, #premium-total-community-validated-minters').forEach(el => {
    if (el) el.textContent = mints;
});

// Update token/item totals for standard rewards
if (state.rewardData.standard.type === 'digital-tokens' && document.getElementById('standard-tokens-per-minter')) {
    const stdTokens = parseFloat(document.getElementById('standard-tokens-per-minter').value) || 0;
    document.getElementById('standard-total-tokens').textContent = (stdTokens * parseFloat(mints)).toFixed(5);
}

if (state.rewardData.standard.type === 'digital-exclusive-items' && document.getElementById('standard-items-per-minter')) {
    const stdItems = parseFloat(document.getElementById('standard-items-per-minter').value) || 0;
    document.getElementById('standard-total-items').textContent = (stdItems * parseFloat(mints)).toFixed(5);
}
}

    // Initialize the application
    init();
});