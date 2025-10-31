// src/hooks/useReviews.js
import { useState, useEffect, useCallback } from 'react';
import reviewService from '../services/reviewService';

// In-memory cache untuk respons API ulasan
const reviewCache = new Map();
// Batas waktu cache: 3 menit (180.000 milidetik)
const CACHE_LIFETIME = 3 * 60 * 1000;

/**
 * Custom hook for fetching reviews
 * @param {string} recipeId - Recipe ID
 * @returns {Object} - { reviews, loading, error, refetch, bustCache }
 */
export function useReviews(recipeId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache key adalah recipeId
  const cacheKey = `reviews_${recipeId}`;

  const fetchReviews = useCallback(async () => {
    if (!recipeId) { // Ganti cek ke recipeId
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // 1. Cek Cache
      const cached = reviewCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp < CACHE_LIFETIME)) {
        // Cache Hit & Belum Kedaluwarsa
        // console.log(`[CACHE HIT] reviews: ${cacheKey}`);
        setReviews(cached.data || []);
        setLoading(false);
        return;
      }
      
      setLoading(true);

      // 2. Fetch dari API (Cache Miss/Expired)
      // console.log(`[CACHE MISS] reviews: ${cacheKey}. Fetching...`);
      const response = await reviewService.getReviews(recipeId); // Ganti ke recipeId
      
      if (response.success) {
        // 3. Update Cache
        reviewCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
        
        setReviews(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [recipeId, cacheKey]); // Tambahkan cacheKey

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    // Fungsi untuk menghapus cache secara manual
    bustCache: () => {
      console.log(`[CACHE INVALIDATE] Menghapus cache: ${cacheKey}`);
      reviewCache.delete(cacheKey);
    },
  };
}

/**
 * Custom hook for creating a review
 * (Hook ini TIDAK perlu invalidasi, komponen yg akan panggil bustCache)
 */
export function useCreateReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createReview = async (recipeId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await reviewService.createReview(recipeId, reviewData);
      
      if (response.success) {
        setSuccess(true);
        return response; // Kembalikan respons jika sukses
      } else {
        setError(response.message || 'Failed to create review');
        return null;
      }
    } catch (err) {
      setError(err.message || 'An error occurred while creating review');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createReview, loading, error, success };
}