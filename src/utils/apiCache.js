// src/utils/apiCache.js

// Simple in-memory cache using a Map
const cache = new Map();

// Atur berapa lama cache valid (Time-to-Live), misal 5 menit
const CACHE_TTL = 5 * 60 * 1000; // 5 menit dalam milidetik

export const apiCache = {
  /**
   * Mengambil data dari cache berdasarkan key.
   * @param {string} key - Kunci unik untuk item cache.
   * @returns {any|null} Data yang di-cache atau null jika tidak ada/kedaluwarsa.
   */
  get: (key) => {
    const cachedItem = cache.get(key);
    if (!cachedItem) {
      return null; // Cache miss
    }

    // Cek apakah cache sudah kedaluwarsa
    const isExpired = (Date.now() - cachedItem.timestamp) > CACHE_TTL;
    if (isExpired) {
      cache.delete(key);
      return null; // Cache expired
    }

    // console.log(`[CACHE HIT] Mengambil data dari cache: ${key}`);
    return cachedItem.data; // Cache hit
  },

  /**
   * Menyimpan data ke cache.
   * @param {string} key - Kunci unik.
   * @param {any} data - Data yang ingin disimpan.
   */
  set: (key, data) => {
    const item = {
      data: data,
      timestamp: Date.now(),
    };
    cache.set(key, item);
    // console.log(`[CACHE SET] Menyimpan data ke cache: ${key}`);
  },

  /**
   * Menghapus cache berdasarkan key.
   * @param {string} key - Kunci yang ingin dihapus.
   */
  invalidate: (key) => {
    cache.delete(key);
    // console.log(`[CACHE INVALIDATE] Menghapus cache: ${key}`);
  },

  /**
   * Menghapus semua cache yang kuncinya dimulai dengan prefix tertentu.
   * Penting untuk menghapus daftar resep saat 1 resep baru dibuat.
   * @param {string} prefix - Prefix kunci (misal: "recipes_")
   */
  invalidatePrefix: (prefix) => {
    let count = 0;
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
        count++;
      }
    }
    // console.log(`[CACHE INVALIDATE] Menghapus ${count} cache dengan prefix: ${prefix}`);
  },

  /**
   * Menghapus semua cache.
   */
  clear: () => {
    cache.clear();
    // console.log('[CACHE CLEAR] Semua cache dihapus.');
  }
};