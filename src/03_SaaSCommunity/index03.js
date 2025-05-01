        // Campaign Data Structure - Will be populated from blockchain/backend
        const campaignData = {
            company: "",
            title: "",
            video: "",
            orientation: "horizontal",
            startingText: "",
            guideline: "",
            mintPrice: "",
            totalMints: 0,
            completionRate: 0,
            standardReward: "",
            premiumReward: "",
            timeRemaining: 0, // in hours
            duration: 0 // in hours
        };

        // State Management
        let activePopup = null;

        // DOM Elements
        const elements = {
            companyName: document.getElementById('company-name-display'),
            campaignTitle: document.getElementById('campaign-title-display'),
            mainVideo: document.getElementById('main-video'),
            mintPrice: document.getElementById('mint-price-value'),
            completionRate: document.getElementById('completion-rate'),
            progressFill: document.getElementById('progress-fill'),
            timeRemaining: document.getElementById('time-remaining'),
            popupOverlay: document.getElementById('popup-overlay'),
            completionPopup: document.getElementById('completion-popup'),
            uploadPreview: document.getElementById('upload-preview'),
            storyText: document.getElementById('story-text'),
            videoUpload: document.getElementById('video-upload'),
            walletConnect: document.getElementById('wallet-connect'),
            walletAddress: document.getElementById('wallet-address')
        };

        // Text Popup Elements
        const textPopups = {
            'starting-text': document.getElementById('starting-text-popup'),
            'guideline': document.getElementById('guideline-popup'),
            'standard-reward': document.getElementById('standard-reward-popup'),
            'premium-reward': document.getElementById('premium-reward-popup')
        };

        // Text Content Elements
        const textContents = {
            'starting-text': document.getElementById('starting-text-content'),
            'guideline': document.getElementById('guideline-content'),
            'standard-reward': document.getElementById('standard-reward-content'),
            'premium-reward': document.getElementById('premium-reward-content')
        };

        // Bubble Elements
        const bubbles = {
            'standard-reward': document.getElementById('standard-reward-bubble'),
            'premium-reward': document.getElementById('premium-reward-bubble'),
            'starting-text': document.getElementById('starting-text-bubble'),
            'guideline': document.getElementById('guideline-bubble')
        };

        // Fetch Campaign Data from Blockchain/Backend
        async function fetchCampaignData() {
            try {
                // In a real implementation, this would fetch from your API/blockchain
                // For demo purposes, we'll simulate an API call
                const response = await fetch('/api/campaign');
                const data = await response.json();
                
                // Update campaign data
                Object.assign(campaignData, data);
                
                // Update UI
                updateUI();
                
                return true;
            } catch (error) {
                console.error("Error fetching campaign data:", error);
                return false;
            }
        }

        // Update UI with current campaign data
        function updateUI() {
            // Company and Title
            elements.companyName.textContent = campaignData.company;
            elements.campaignTitle.textContent = campaignData.title;
            
            // Video
            elements.mainVideo.src = campaignData.video;
            elements.mainVideo.classList.toggle('video-vertical', campaignData.orientation === 'vertical');
            
            // Mint Price
            elements.mintPrice.textContent = campaignData.mintPrice;
            
            // Progress
            updateProgress();
            
            // Popup Contents
            textContents['starting-text'].textContent = campaignData.startingText;
            textContents['guideline'].textContent = campaignData.guideline;
            textContents['standard-reward'].textContent = campaignData.standardReward;
            textContents['premium-reward'].textContent = campaignData.premiumReward;
        }

        // Update progress bar and time remaining
        function updateProgress() {
            const completionRate = Math.min(100, Math.max(0, campaignData.completionRate));
            elements.completionRate.textContent = `${completionRate}% completed`;
            elements.progressFill.style.width = `${completionRate}%`;
            
            // Calculate time remaining
            const hours = campaignData.timeRemaining;
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            const totalDays = Math.ceil(campaignData.duration / 24);
            
            let timeText = `Time remaining: ${hours}h`;
            if (days > 0) {
                timeText = `Time remaining: ${days}d ${remainingHours}h (${totalDays} days total)`;
            }
            elements.timeRemaining.textContent = timeText;
        }

        // Popup Management
        function showPopup(type) {
            // Close any active popup
            if (activePopup) {
                textPopups[activePopup].classList.remove('active');
            }
            
            // Show new popup
            elements.popupOverlay.classList.add('active');
            textPopups[type].classList.add('active');
            activePopup = type;
        }

        function closeActivePopup() {
            if (activePopup) {
                textPopups[activePopup].classList.remove('active');
                elements.popupOverlay.classList.remove('active');
                activePopup = null;
            }
        }

        function openCompletionPopup() {
            elements.popupOverlay.classList.add('active');
            elements.completionPopup.classList.add('active');
        }

        function closeCompletionPopup() {
            elements.completionPopup.classList.remove('active');
            elements.popupOverlay.classList.remove('active');
        }

        // Handle Video Upload
        function handleVideoUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file
            if (file.size > 50 * 1024 * 1024) { // 50MB max
                alert("Please upload a video smaller than 50MB");
                return;
            }
            
            if (!file.type.includes('video/mp4')) {
                alert("Please upload an MP4 video file");
                return;
            }
            
            // Create preview
            const videoUrl = URL.createObjectURL(file);
            elements.uploadPreview.src = videoUrl;
        }

        // Connect Wallet
        async function connectWallet() {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const walletAddress = accounts[0];
                    elements.walletAddress.textContent = 
                        `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
                    return walletAddress;
                } catch (error) {
                    console.error("User rejected request:", error);
                }
            } else {
                alert("Please install MetaMask or another Web3 provider");
            }
            return null;
        }

        // Submit Completion to Blockchain
        async function submitCompletion() {
            const text = elements.storyText.value;
            const videoFile = elements.videoUpload.files[0];
            
            // Validation
            if (!text || text.length < 100) {
                alert('Please enter at least 100 characters for your story.');
                return;
            }
            
            if (!videoFile) {
                alert('Please upload a video file.');
                return;
            }
            
            // Connect wallet if not already connected
            const walletAddress = await connectWallet();
            if (!walletAddress) return;
            
            try {
                // In a real implementation, you would:
                // 1. Upload video to IPFS or similar
                // 2. Get the content hash
                // 3. Submit text and hash to blockchain
                
                // For demo purposes, we'll simulate this
                alert('Completion submitted successfully!');
                closeCompletionPopup();
                
                // Reset form
                elements.storyText.value = '';
                elements.uploadPreview.src = '';
                elements.videoUpload.value = '';
                
                // Refresh campaign data
                await fetchCampaignData();
            } catch (error) {
                console.error("Submission failed:", error);
                alert('Submission failed. Please try again.');
            }
        }

        // Navigation between campaigns
        function prevCampaign() {
            // In a real implementation, this would load the previous campaign
            console.log("Loading previous campaign");
        }

        function nextCampaign() {
            // In a real implementation, this would load the next campaign
            console.log("Loading next campaign");
        }

        // Initialize the application
        async function init() {
            // Load campaign data
            await fetchCampaignData();
            
            // Setup bubble click events for popups
            document.getElementById('standard-reward-bubble').addEventListener('click', () => {
                showPopup('standard-reward');
            });
            
            document.getElementById('premium-reward-bubble').addEventListener('click', () => {
                showPopup('premium-reward');
            });
            
            document.getElementById('starting-text-bubble').addEventListener('click', () => {
                showPopup('starting-text');
            });
            
            document.getElementById('guideline-bubble').addEventListener('click', () => {
                showPopup('guideline');
            });
            
            // Setup wallet connection
            elements.walletConnect.addEventListener('click', connectWallet);
            
            // Setup video upload
            elements.videoUpload.addEventListener('change', handleVideoUpload);
            
            // Close popups when clicking overlay
            elements.popupOverlay.addEventListener('click', (e) => {
                if (e.target === elements.popupOverlay) {
                    closeActivePopup();
                    closeCompletionPopup();
                }
            });
        }

        // Start the application
        document.addEventListener('DOMContentLoaded', init);