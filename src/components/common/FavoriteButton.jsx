// src/components/common/FavoriteButton.jsx
import { Heart, Loader } from 'lucide-react';
// Impor hook 'useIsFavorited' yang benar dari modul
import { useIsFavorited } from '../../hooks/useFavorites';

/**
 * FavoriteButton Component
 * Versi ini sudah diperbaiki untuk menggunakan API (via useIsFavorited hook)
 * bukan localStorage.
 */
export default function FavoriteButton({ recipeId, size = 'md' }) {
  
  // Panggil hook yang berbicara dengan API
  // Hook ini memberi kita status favorit (isFavorited) dan fungsi untuk men-toggle-nya (toggleFavorite)
  const { 
    isFavorited, 
    loading: favLoading, 
    toggleFavorite 
  } = useIsFavorited(recipeId);

  
  const handleToggle = async (e) => {
    e.stopPropagation(); // Mencegah klik pada card di belakangnya
    e.preventDefault(); // Mencegah event lain jika tombol ada di dalam link
    
    // Panggil fungsi toggleFavorite dari hook, yang akan mengirim request ke API
    await toggleFavorite();
  };

  // Logika untuk ukuran tombol (ini tetap sama)
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={favLoading} // Nonaktifkan tombol saat sedang loading
      className={`
        ${sizes[size] || sizes['md']} rounded-full flex items-center
        justify-center gap-1.5
        transition-all duration-200
        ${isFavorited
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-white/90 hover:bg-white text-slate-700 hover:text-red-500'
        }
        backdrop-blur-sm shadow-md hover:shadow-lg
        disabled:opacity-50 disabled:cursor-wait
        group
      `}
      title={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
    >
      {/* Tampilkan loader jika sedang proses API call */}
      {favLoading ? (
        <Loader className={`${iconSizes[size] || iconSizes['md']} animate-spin`} />
      ) : (
        <Heart
          className={`
            ${iconSizes[size] || iconSizes['md']}
            transition-all duration-200
            ${isFavorited ? 'fill-current' : ''}
          `}
        />
      )}
    </button>
  );
}