// Constants
const EARNINGS_PER_CONSULTATION = 500;

// Load and display statistics
function loadStatistics() {
    // Get current stats from localStorage (default to 98 if not set)
    let totalConsultations = parseInt(localStorage.getItem('totalConsultations') || '98');

    // Increment consultation count (this consultation just completed)
    totalConsultations += 1;

    // Save updated count
    localStorage.setItem('totalConsultations', totalConsultations.toString());

    // Calculate earnings
    const totalEarnings = totalConsultations * EARNINGS_PER_CONSULTATION;

    // Display statistics with animation
    animateValue('total-consultations', 0, totalConsultations, 1000);
    animateValue('total-earnings', 0, totalEarnings, 1000, true);
}

// Animate number counting up
function animateValue(elementId, start, end, duration, isCurrency = false) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }

        if (isCurrency) {
            element.textContent = `¥${Math.floor(current).toLocaleString()}`;
        } else {
            element.textContent = Math.floor(current).toString();
        }
    }, 16);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
});
