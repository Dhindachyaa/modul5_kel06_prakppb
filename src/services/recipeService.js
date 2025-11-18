// src/services/recipeService.js
import { apiClient } from '../config/api';
import { apiCache } from '../utils/apiCache'; // <-- IMPORT CACHE

class RecipeService {
  /**
   * Get all recipes (dengan cache)
   */
  async getRecipes(params = {}) {
    const cacheKey = `recipes_${JSON.stringify(params)}`;
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await apiClient.get('/api/v1/recipes', { params });
      apiCache.set(cacheKey, response); // Simpan ke cache
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recipe by ID (dengan cache)
   */
  async getRecipeById(id) {
    const cacheKey = `recipe_${id}`;
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await apiClient.get(`/api/v1/recipes/${id}`);
      apiCache.set(cacheKey, response); // Simpan ke cache
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new recipe (INVALIDASI CACHE)
   */
  async createRecipe(recipeData) {
    try {
      const response = await apiClient.post('/api/v1/recipes', recipeData);
      
      // Hapus cache daftar resep
      apiCache.invalidatePrefix('recipes_');

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing recipe (INVALIDASI CACHE)
   */
  async updateRecipe(id, recipeData) {
    try {
      const response = await apiClient.put(`/api/v1/recipes/${id}`, recipeData);

      // Hapus cache daftar resep DAN cache resep detail ini.
      apiCache.invalidatePrefix('recipes_');
      apiCache.invalidate(`recipe_${id}`);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Partially update recipe (INVALIDASI CACHE)
   */
  async patchRecipe(id, partialData) {
    try {
      const response = await apiClient.patch(`/api/v1/recipes/${id}`, partialData);

      apiCache.invalidatePrefix('recipes_');
      apiCache.invalidate(`recipe_${id}`);

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete recipe (INVALIDASI CACHE)
   */
  async deleteRecipe(id) {
    try {
      const response = await apiClient.delete(`/api/v1/recipes/${id}`);

      apiCache.invalidatePrefix('recipes_');
      apiCache.invalidate(`recipe_${id}`);
      apiCache.invalidatePrefix('favorites_'); // Hapus cache favorit juga

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new RecipeService();