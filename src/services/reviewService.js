// src/services/reviewService.js
import { apiClient } from '../config/api';
import { apiCache } from '../utils/apiCache'; // <-- IMPORT CACHE

class ReviewService {
  /**
   * Get all reviews for a recipe (dengan cache)
   */
  async getReviews(recipeId) {
    const cacheKey = `reviews_${recipeId}`;

    // 1. Cek cache
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 2. Panggil API
    try {
      const response = await apiClient.get(`/api/v1/recipes/${recipeId}/reviews`);
      
      // 3. Simpan ke cache
      apiCache.set(cacheKey, response);
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

      // --- INVALIDASI CACHE ---
      // Ulasan baru mengubah rating resep. Hapus cache untuk resep detail
      // dan juga cache untuk daftar ulasan resep ini.
      apiCache.invalidate(`recipe_${recipeId}`);
      apiCache.invalidate(`reviews_${recipeId}`);

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
      
      // Sulit mengetahui recipeId dari reviewId, jadi kita
      // hapus saja SEMUA cache resep dan ulasan.
      apiCache.invalidatePrefix('recipe_');
      apiCache.invalidatePrefix('reviews_');

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

      // Sama seperti update, kita hapus semua cache resep/ulasan.
      apiCache.invalidatePrefix('recipe_');
      apiCache.invalidatePrefix('reviews_');

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new ReviewService();