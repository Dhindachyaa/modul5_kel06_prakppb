// src/services/reviewService.js
import { apiClient } from '../config/api';
import { apiCache } from '../utils/apiCache'; // <-- IMPORT CACHE

class ReviewService {
  /**
   * Get all reviews for a recipe (dengan cache)
   */
  async getReviews(recipeId) {
    const cacheKey = `reviews_${recipeId}`;
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await apiClient.get(`/api/v1/recipes/${recipeId}/reviews`);
      apiCache.set(cacheKey, response); // Simpan ke cache
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create review for a recipe (INVALIDASI CACHE)
   */
  async createReview(recipeId, reviewData) {
    try {
      const response = await apiClient.post(`/api/v1/recipes/${recipeId}/reviews`, reviewData);

      // Hapus cache ulasan, resep detail, dan daftar resep (karena rating berubah)
      apiCache.invalidate(`reviews_${recipeId}`);
      apiCache.invalidate(`recipe_${recipeId}`);
      apiCache.invalidatePrefix('recipes_');

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing review (INVALIDASI CACHE)
   */
  async updateReview(reviewId, reviewData) {
    try {
      const response = await apiClient.put(`/api/v1/reviews/${reviewId}`, reviewData);
      
      // Hapus semua cache yg relevan
      apiCache.invalidatePrefix('reviews_');
      apiCache.invalidatePrefix('recipe_');
      apiCache.invalidatePrefix('recipes_');

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete review (INVALIDASI CACHE)
   */
  async deleteReview(reviewId) {
    try {
      const response = await apiClient.delete(`/api/v1/reviews/${reviewId}`);

      // Hapus semua cache yg relevan
      apiCache.invalidatePrefix('reviews_');
      apiCache.invalidatePrefix('recipe_');
      apiCache.invalidatePrefix('recipes_');

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new ReviewService();