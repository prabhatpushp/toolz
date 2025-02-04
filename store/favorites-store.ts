import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
    favorites: (number | string)[];
    toggleFavorite: (id: number | string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set) => ({
            favorites: [],
            toggleFavorite: (id) =>
                set((state) => ({
                    favorites: state.favorites.includes(id)
                        ? state.favorites.filter((fav) => fav !== id)
                        : [...state.favorites, id],
                })),
        }),
        {
            name: 'toolFavorites',
        }
    )
);
