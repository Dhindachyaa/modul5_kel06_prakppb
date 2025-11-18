// src/pages/ProfilePage.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import userService from '../services/userService';
import { Camera, Edit3, Loader, Star, Clock, ChefHat, Heart, User, Check, X } from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';

// URL placeholder
const DEFAULT_AVATAR = 'https://avatar.vercel.sh/user.png?size=200';
const placeholderImg = 'https://via.placeholder.com/400x300.png?text=Gambar+Tidak+Tersedia';

function FavoriteRecipeCard({ recipe, onClick }) {
  const categoryColor = recipe.category === 'minuman' ? 'green' : 'blue';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-3xl overflow-hidden shadow-lg shadow-${categoryColor}-500/5 hover:shadow-${categoryColor}-500/15 transition-all duration-500 cursor-pointer group-hover:scale-105`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.image_url || placeholderImg}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold ${
            categoryColor === 'blue'
              ? 'text-blue-700 bg-blue-100/90'
              : 'text-green-700 bg-green-100/90'
          } px-3 py-1.5 rounded-full`}
        >
          {recipe.category}
        </span>
      </div>
      <div className="relative z-10 p-5">
        <h3 className="font-bold text-slate-800 text-lg mb-3 line-clamp-2 group-hover:text-blue-600">
          {recipe.name}
        </h3>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{recipe.prep_time} mnt</span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-full">
            <ChefHat className="w-4 h-4" />
            <span className="font-medium capitalize">{recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen utama Halaman Profil
export default function ProfilePage({ onRecipeClick }) {
  const [profile, setProfile] = useState(userService.getUserProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(profile.username);
  const [tempBio, setTempBio] = useState(profile.bio || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const {
    favorites,
    loading: favLoading,
    error: favError,
  } = useFavorites();

  const [activeTab, setActiveTab] = useState('semua'); // 'semua', 'makanan', 'minuman'
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Format file harus .jpg, .jpeg, .png, atau .webp');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const result = userService.updateAvatar(base64String);
      
      if (result.success) {
        setProfile(result.data);
      } else {
        alert('Gagal memperbarui foto: ' + result.message);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const handleEditClick = () => {
    setTempUsername(profile.username);
    setTempBio(profile.bio || '');
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };
  
  const handleProfileSave = () => {
    if (tempUsername.trim().length < 3) {
      alert('Nama pengguna minimal 3 karakter');
      return;
    }
    userService.updateUsername(tempUsername);
    const finalResult = userService.updateBio(tempBio);

    if (finalResult.success) {
      setProfile(finalResult.data);
      setIsEditing(false);
    } else {
      alert('Gagal menyimpan profil: ' + finalResult.message);
    }
  };

  const foodFavorites = useMemo(() => {
    return favorites.filter(recipe => recipe.category === 'makanan');
  }, [favorites]);

  const drinkFavorites = useMemo(() => {
    return favorites.filter(recipe => recipe.category === 'minuman');
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    if (activeTab === 'makanan') {
      return foodFavorites;
    }
    if (activeTab === 'minuman') {
      return drinkFavorites;
    }
    return favorites; // 'semua'
  }, [favorites, activeTab, foodFavorites, drinkFavorites]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20 md:pb-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-white/40 mb-12">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={profile.avatar || DEFAULT_AVATAR}
                alt="Foto Profil"
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR }}
              />
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-all hover:scale-110"
                title="Ganti Foto"
              >
                {isUploading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
              />
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nama Pengguna
                    </label>
                    <input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan nama..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Tulis bio singkat..."
                      maxLength="150"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleProfileSave}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> Simpan
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-800">
                      {profile.username}
                    </h1>
                  </div>
                  <p className="text-slate-600 italic mb-4">
                    {profile.bio || "Bio belum diatur."}
                  </p>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl transition-colors font-medium"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Profil
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-slate-200 mt-6 pt-6 flex justify-center">
            <div className="text-center px-6">
              <p className="text-3xl font-bold text-slate-800">
                {favLoading ? (
                  <Loader className="w-7 h-7 animate-spin mx-auto" /> 
                ) : (
                  favorites.length
                )}
              </p>
              <p className="text-sm font-medium text-slate-500">
                Resep Favorit
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
            Resep Favorit Saya
          </h2>

          <div className="flex items-center gap-2 border-b border-slate-200 mb-8">
            <button
              onClick={() => setActiveTab('semua')}
              className={`px-4 py-3 font-medium transition-colors border-b-2
                ${activeTab === 'semua' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
            >
              Semua
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'semua' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {favorites.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('makanan')}
              className={`px-4 py-3 font-medium transition-colors border-b-2
                ${activeTab === 'makanan' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
            >
              Makanan
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'makanan' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {foodFavorites.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('minuman')}
              className={`px-4 py-3 font-medium transition-colors border-b-2
                ${activeTab === 'minuman' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
            >
              Minuman
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'minuman' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {drinkFavorites.length}
              </span>
            </button>
          </div>

          {favLoading && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="mt-4 text-slate-600">Memuat resep favorit...</p>
            </div>
          )}

          {favError && (
            <div className="text-center py-12 bg-red-50 border border-red-200 rounded-2xl p-6">
              <p className="text-red-600 font-semibold">Terjadi Kesalahan</p>
              <p className="text-red-500">{favError}</p>
            </div>
          )}

          {!favLoading && !favError && (
            <>
              {favorites.length === 0 ? (
                <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/40">
                  <h3 className="text-2xl font-semibold text-slate-700">
                    Belum Ada Favorit
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Anda belum menambahkan resep apapun ke favorit.
                  </p>
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/40">
                  <h3 className="text-2xl font-semibold text-slate-700">
                    Tidak Ditemukan
                  </h3>
                  <p className="text-slate-500 mt-2">
                    Anda tidak memiliki resep {activeTab} di favorit Anda.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredFavorites.map((recipe) => (
                    <FavoriteRecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => onRecipeClick(recipe.id, recipe.category)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}