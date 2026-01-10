// lib/avatar.js

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Normalize avatar URL
 * @param {string} avatar
 * @returns {string}
 */
export function getAvatarUrl(avatar) {
  // no avatar OR empty string
  if (!avatar) {
    return '/default-avatar.png';
  }

  // already full URL (cloudinary etc.)
  if (avatar.startsWith('http')) {
    return avatar;
  }

  // backend relative path -> make full URL
  return `${API_BASE}${avatar}`;
}
