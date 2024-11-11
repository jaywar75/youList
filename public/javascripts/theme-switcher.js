document.addEventListener('DOMContentLoaded', function () {
    const themeSelector = document.getElementById('theme-selector');

    // Apply the saved theme on page load
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
    themeSelector.value = savedTheme;

    // Listen for theme changes
    themeSelector.addEventListener('change', function () {
        const selectedTheme = themeSelector.value;
        document.body.className = selectedTheme;
        localStorage.setItem('theme', selectedTheme);
    });
});
