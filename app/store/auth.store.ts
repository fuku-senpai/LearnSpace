import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface User {
  role?: string
  fullName?: string
  refreshToken?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean
  setAuth: (data: {
    role?: string
    fullName?: string
    refreshToken?: string
  }) => void

  clearAuth: () => void
  setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
     
        user: null,
        isAuthenticated: false,
        isHydrated: false,
        
        setAuth: (data) =>
          set(
            {
              user: {
                fullName: data.fullName,
                role: data.role,
                refreshToken: data.refreshToken
              },
              isAuthenticated: true,
            },
            false,
            "setAuth"
          ),

        clearAuth: () =>
          set(
            {
              user: null,
              isAuthenticated: false,
            },
            false,
            "clearAuth"
          ),

        setHydrated: () => set({ isHydrated: true }),
      }),
      {
        name: "auth-storage",
        onRehydrateStorage: () => (state) => {
          state?.setHydrated()
        },
      }
    ),
    { name: "auth-store" }
  )
)