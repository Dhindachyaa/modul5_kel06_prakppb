// src/utils/helpers.js

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('id-ID', options);
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time string
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Baru saja';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  }
  // Fallback jika lebih dari seminggu
  return date.toLocaleDateString('id-ID');
}

/**
 * Get difficulty badge color
 * @param {string} difficulty - Recipe difficulty
 * @returns {string} - Tailwind color classes
 */
export function getDifficultyColor(difficulty) {
  const colors = {
    mudah: 'bg-green-100 text-green-800',
    sedang: 'bg-yellow-100 text-yellow-800',
    sulit: 'bg-red-100 text-red-800',
  };
  return colors[difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

/**
 * Get category icon/emoji
 * @param {string} category - Recipe category
 * @returns {string} - Emoji
 */
export function getCategoryEmoji(category) {
  const emojis = {
    makanan: '🍲',
    minuman: '🍹',
  };
  return emojis[category?.toLowerCase()] || '🍴';
}

/**
 * Validate rating (1-5)
 * @param {number} rating - Rating value
 * @returns {boolean} - Is valid
 */
export function isValidRating(rating) {
  return typeof rating === 'number' && rating >= 1 && rating <= 5;
}

/**
 * Generate star rating display
 * @param {number} rating - Rating value (0-5)
 * @returns {string} - Star string
 */
export function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5; // Tidak dipakai di modul, tapi bagus untuk masa depan
  const emptyStars = 5 - fullStars; // Modul Anda menggunakan Math.round, jadi kita ikuti itu
  
  const roundedRating = Math.round(rating);
  return '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
}

/**
 * Truncate text to specific length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} - Truncated text
 */
export function truncateText(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - True if successful
 */
export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // API modern yang aman
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false);
  } else {
    // Fallback untuk browser lama atau HTTP
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    textArea.style.left = "-999999px"; 
    textArea.style.top = "-999999px"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return Promise.resolve(successful);
    } catch (err) {
      document.body.removeChild(textArea);
      return Promise.resolve(false);
    }
  }
}