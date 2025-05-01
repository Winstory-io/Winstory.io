  // Update wallet address dynamically
  function updateWalletAddress(walletAddress) {
    if (walletAddress) {
        document.getElementById('wallet-address').textContent = `by [Wallet Address Community Member]`;
    }
}

// Call with example address
updateWalletAddress("0x7f5c764cbc14f9669b88837ca1490cca17c316a4b");

// Popup functions
function openPopup(id) {
    document.getElementById(id + 'Popup').classList.add('active');
}

function closePopup(id) {
    document.getElementById(id + 'Popup').classList.remove('active');
}

// Close popup when clicking outside content
document.querySelectorAll('.popup').forEach(popup => {
    popup.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// Scoring system functionality
const validScoreBtn = document.getElementById('validScoreBtn');
const scoreSlider = document.getElementById('scoreSlider');
const currentScore = document.getElementById('currentScore');
const confirmScoreBtn = document.getElementById('confirmScoreBtn');
const sliderFill = document.querySelector('.slider-fill');
const scoreDescription = document.getElementById('scoreDescription');
const unavailableScoresContainer = document.getElementById('unavailableScores');

// Array to store used scores (will be loaded from database in production)
let usedScores = [25, 75]; // Example of already used scores

// Function to update score marker display
function updateUnavailableScores() {
    unavailableScoresContainer.innerHTML = '';
    
    usedScores.forEach(score => {
        const marker = document.createElement('div');
        marker.className = 'unavailable-marker';
        marker.style.left = `${score}%`;
        unavailableScoresContainer.appendChild(marker);
    });
}

// Update slider appearance and text based on score
function updateSlider() {
    const score = parseInt(scoreSlider.value);
    
    // Update fill width
    sliderFill.style.width = `${score}%`;
    
    // Update score display
    currentScore.textContent = score;
    confirmScoreBtn.textContent = `Score ${score}/100`;
    
    // Update score color based on value
    let scoreColor;
    if (score < 30) {
        scoreColor = '#ff4444'; // Red for low scores
        scoreDescription.textContent = 'Poor quality content';
    } else if (score < 50) {
        scoreColor = '#ff8800'; // Orange for below average
        scoreDescription.textContent = 'Below average content';
    } else if (score < 70) {
        scoreColor = '#ffcc00'; // Yellow for average
        scoreDescription.textContent = 'Average quality content';
    } else if (score < 90) {
        scoreColor = '#88cc00'; // Light green for good
        scoreDescription.textContent = 'Good quality content';
    } else {
        scoreColor = '#00ff88'; // Green for excellent
        scoreDescription.textContent = 'Excellent quality content';
    }
    
    currentScore.style.color = scoreColor;
    
    // Check if score is already used
    if (usedScores.includes(score)) {
        confirmScoreBtn.disabled = true;
        confirmScoreBtn.style.opacity = '0.5';
        confirmScoreBtn.style.cursor = 'not-allowed';
        scoreDescription.textContent = '⚠️ This score has already been used';
    } else {
        confirmScoreBtn.disabled = false;
        confirmScoreBtn.style.opacity = '1';
        confirmScoreBtn.style.cursor = 'pointer';
    }
}

// Add event listener to the Valid & Score button
validScoreBtn.addEventListener('click', function(e) {
    e.preventDefault();
    openPopup('scoring');
    updateUnavailableScores();
    updateSlider(); // Initialize slider state
});

// Add event listener to the slider
scoreSlider.addEventListener('input', updateSlider);

// Add event listener to the confirm button
confirmScoreBtn.addEventListener('click', function() {
    if (!confirmScoreBtn.disabled) {
        const score = parseInt(scoreSlider.value);
        // Here you would save the score to your database
        usedScores.push(score); // Add to used scores
        
        // Show success message or redirect
        alert(`Content scored successfully with ${score}/100!`);
        
        // Close the popup
        closePopup('scoring');
    }
});

// Function to update progress bars based on data
function updateProgressBars(data) {
    // Update voters progress
    const votersProgress = document.getElementById('voters-progress');
    const currentVoters = document.getElementById('current-voters');
    if (data.currentVoters && data.requiredVoters) {
        const votersPercentage = (data.currentVoters / data.requiredVoters) * 100;
        votersProgress.style.width = `${Math.min(votersPercentage, 100)}%`;
        currentVoters.textContent = `${data.currentVoters}/${data.requiredVoters}`;
    }
    
    // Update staked amount progress
    const stakedProgress = document.getElementById('staked-progress');
    const stakedAmount = document.getElementById('staked-amount');
    const mintPrice = document.getElementById('mint-price');
    if (data.stakedAmount && data.mintPrice !== undefined) {
        const stakedPercentage = (data.stakedAmount / (data.mintPrice || 1)) * 100;
        stakedProgress.style.width = `${stakedPercentage}%`;
        stakedAmount.textContent = `${data.stakedAmount.toLocaleString()} $`;
        
        // Check if mint price is free
        if (data.mintPrice === 0) {
            mintPrice.innerHTML = '<span style="color: var(--primary);">FREE</span>';
        } else {
            mintPrice.textContent = `${data.mintPrice.toLocaleString()} $`;
        }
    }
    
    // Update vote ratio progress
    const approveRatio = document.getElementById('approve-ratio');
    const rejectRatio = document.getElementById('reject-ratio');
    if (data.approveVotes !== undefined && data.rejectVotes !== undefined) {
        const totalVotes = data.approveVotes + data.rejectVotes;
        if (totalVotes > 0) {
            const approvePercentage = (data.approveVotes / totalVotes) * 100;
            const rejectPercentage = (data.rejectVotes / totalVotes) * 100;
            
            approveRatio.style.width = `${approvePercentage}%`;
            rejectRatio.style.width = `${rejectPercentage}%`;
        } else {
            // Default when no votes
            approveRatio.style.width = '50%';
            rejectRatio.style.width = '50%';
        }
    }
}

// Example data - in production this would come from your backend
const completionData = {
    currentVoters: 15,
    requiredVoters: 22,
    stakedAmount: 1240,
    mintPrice: 1000,  // Set to 0 for FREE
    approveVotes: 67,
    rejectVotes: 33
};

// Update the progress bars when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updateProgressBars(completionData);
});

// This function could be called whenever data changes
function refreshProgressData() {
    // In a real application, you would fetch new data from your backend
    // Then call updateProgressBars with the new data
    fetch('/api/completion-data')
        .then(response => response.json())
        .then(data => {
            updateProgressBars(data);
        })
        .catch(error => {
            console.error('Error fetching progress data:', error);
        });
}