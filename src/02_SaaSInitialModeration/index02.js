        // Popup Management
        let activePopup = null;

        function openPopup(id) {
            // Close any active popup
            if (activePopup) {
                document.getElementById(activePopup + '-popup').classList.remove('active');
            }
            
            // Show new popup
            document.getElementById('popup-overlay').classList.add('active');
            document.getElementById(id + '-popup').classList.add('active');
            activePopup = id;
        }

        function closePopup(id) {
            document.getElementById(id + '-popup').classList.remove('active');
            document.getElementById('popup-overlay').classList.remove('active');
            activePopup = null;
        }

        // Close popup when clicking overlay
        document.getElementById('popup-overlay').addEventListener('click', function(e) {
            if (e.target === this && activePopup) {
                closePopup(activePopup);
            }
        });

        // Setup bubble click events for popups
        document.getElementById('standard-reward-bubble').addEventListener('click', function() {
            openPopup('standard-reward');
        });
        
        document.getElementById('premium-reward-bubble').addEventListener('click', function() {
            openPopup('premium-reward');
        });
        
        document.getElementById('starting-text-bubble').addEventListener('click', function() {
            openPopup('starting-text');
        });
        
        document.getElementById('guideline-bubble').addEventListener('click', function() {
            openPopup('guideline');
        });

        // Play button toggle
        document.querySelector('.play-button').addEventListener('click', function() {
            this.textContent = this.textContent === '▶' ? '❚❚' : '▶';
        });