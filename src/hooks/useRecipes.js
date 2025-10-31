// src/hooks/useRecipes.js
import { useState, useEffect, useCallback } from 'react';
import recipeService from '../services/recipeService';

// Cache in-memory untuk resep
const recipeCache = new Map();
const CACHE_LIFETIME = 5 * 60 * 1000; // 5 menit

// --- FUNGSI INVALIDASI (PENGHAPUS CACHE) ---
// Kita export fungsi ini agar bisa dipanggil dari komponen lain (Create, Edit, Delete)

/**
 * Menghapus cache untuk daftar resep (misal: halaman Makanan/Minuman)
 */
export function invalidateRecipeListCache() {
  console.log('[CACHE INVALIDATE] Menghapus semua cache daftar resep (recipes_)...');
  for (const key of recipeCache.keys()) {
    if (key.startsWith('recipes_')) {
      recipeCache.delete(key);
    }
  }
}

/**
 * Menghapus cache untuk resep individual (halaman Detail)
 * @param {string} recipeId - ID resep yang akan dihapus cachenya
 */
export function invalidateRecipeCache(recipeId) {
  const cacheKey = `recipe_${recipeId}`;
  console.log(`[CACHE INVALIDATE] Menghapus cache resep: ${cacheKey}`);
  recipeCache.delete(cacheKey);
}
// --- AKHIR FUNGSI INVALIDASI ---


/**
 * Custom hook untuk fetching BANYAK recipes (dengan cache)
 */
export function useRecipes(params = {}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Buat cache key unik berdasarkan parameter
  const cacheKey = `recipes_${JSON.stringify(params)}`;

  const fetchRecipes = useCallback(async () => {
    try {
      setError(null);
      
      // 1. Cek Cache
      const cached = recipeCache.get(cacheKey);
      const now = Date.now();
      if (cached && (now - cached.timestamp < CACHE_LIFETIME)) {
        // console.log(`[CACHE HIT] recipes: ${cacheKey}`);
        setRecipes(cached.data.data || []);
        setPagination(cached.data.pagination || null);
        setLoading(false);
        return;
      }

      setLoading(true);
      // 2. Fetch dari API (Cache Miss)
      // console.log(`[CACHE MISS] recipes: ${cacheKey}. Fetching...`);
      const response = await recipeService.getRecipes(params);
      
      if (response.success) {
        // 3. Simpan ke Cache
        recipeCache.set(cacheKey, { data: response, timestamp: now });
        setRecipes(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to fetch recipes');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [cacheKey]); // Dependency diubah ke cacheKey

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return { recipes, loading, error, pagination, refetch: fetchRecipes };
}

/**
 * Custom hook for fetching SATU recipe (dengan cache)
 */
export function useRecipe(id) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheKey = `recipe_${id}`;

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);

      // 1. Cek Cache
      const cached = recipeCache.get(cacheKey);
      const now = Date.now();
      if (cached && (now - cached.timestamp < CACHE_LIFETIME)) {
        // console.log(`[CACHE HIT] recipe: ${cacheKey}`);
        setRecipe(cached.data.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      // 2. Fetch dari API (Cache Miss)
      // console.log(`[CACHE MISS] recipe: ${cacheKey}. Fetching...`);
      const response = await recipeService.getRecipeById(id);

      if (response.success) {
        // 3. Simpan ke Cache
        recipeCache.set(cacheKey, { data: response, timestamp: now });
        setRecipe(response.data);
      } else {
        setError(response.message || 'Failed to fetch recipe');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching recipe');
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [id, cacheKey]); // tambahkan cacheKey

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return { recipe, loading, error, refetch: fetchRecipe };
}