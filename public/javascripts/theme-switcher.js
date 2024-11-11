// theme-switcher.js

// Function to apply the selected theme
function applyTheme(theme) {
    // Remove any existing theme classes on the body
    document.body.classList.remove('light-theme', 'dark-theme', 'high-contrast-theme');

    // Add the new theme class to the body
    document.body.classList.add(theme);

    // Save the selected theme to local storage
    localStorage.setItem('selectedTheme', theme);
}

// Function to load and apply the stored theme on page load
function loadTheme() {
    // Retrieve the stored theme from local storage, default to 'light-theme' if none found
    const storedTheme = localStorage.getItem('selectedTheme') || 'light-theme';

    // Apply the stored theme
    applyTheme(storedTheme);

    // Set the dropdown to match the stored theme
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.value = storedTheme;
    }
}

// Event listener for the theme dropdown selection
function setupThemeListener() {
    const themeSelector = document.getElementById('theme-selector');

    // Check if the selector exists
    if (themeSelector) {
        // Listen for changes on the dropdown
        themeSelector.addEventListener('change', (event) => {
            const selectedTheme = event.target.value;
            applyTheme(selectedTheme);
        });
    }
}

// Initialize theme settings on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTheme();       // Load and apply the saved theme
    setupThemeListener(); // Set up the listener for theme changes
});
