document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
        // Add functionality here for each option when clicked
        console.log('Selected:', this.querySelector('.option-title').textContent);
        // For example: window.location.href = 'next-page.html';
    });
});