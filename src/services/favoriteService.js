// src/services/favoriteService.js
import { apiClient } from '../config/api';
import { apiCache } from '../utils/apiCache'; // <-- IMPORT CACHE

class FavoriteService {
  /**
   * Get all favorite recipes by user identifier (dengan cache)
   */
  async getFavorites(userIdentifier) {
    const cacheKey = `favorites_${userIdentifier}`;
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await apiClient.get('/api/v1/favorites', {
        params: { user_identifier: userIdentifier }
      });
      apiCache.set(cacheKey, response); // Simpan ke cache
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle favorite (INVALIDASI CACHE)
   */
  async toggleFavorite(data) {
    try {
      const response = await apiClient.post('/api/v1/favorites/toggle', data);

      // Hapus cache daftar favorit untuk user ini.
      apiCache.invalidate(`favorites_${data.user_identifier}`);

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new FavoriteService();