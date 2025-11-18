// src/hooks/useRecipes.js
import { useState, useEffect, useCallback } from 'react';
import recipeService from '../services/recipeService';

/**
 * Custom hook untuk fetching BANYAK recipes
 */
export function useRecipes(params = {}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recipeService.getRecipes(params);
      
      if (response.success) {
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
  }, [JSON.stringify(params)]); // Gunakan JSON.stringify untuk dependensi yang stabil

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return { recipes, loading, error, pagination, refetch: fetchRecipes };
}

/**
 * Custom hook for fetching SATU recipe
 */
export function useRecipe(id) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await recipeService.getRecipeById(id);

      if (response.success) {
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
  }, [id]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return { recipe, loading, error, refetch: fetchRecipe };
}