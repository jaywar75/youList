// public/javascripts/theme.js

document.addEventListener('DOMContentLoaded', function () {
    const themeSelector = document.getElementById('theme-selector');
    const body = document.body;

    // Load saved theme from localStorage or default to light-theme
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    body.classList.add(savedTheme);
    themeSelector.value = savedTheme;

    themeSelector.addEventListener('change', function () {
        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme', 'high-contrast-theme');
        // Add the selected theme class
        const selectedTheme = this.value;
        body.classList.add(selectedTheme);
        // Save the selected theme to localStorage
        localStorage.setItem('theme', selectedTheme);
    });
});
