import { create } from 'zustand'
import { tokenStorage } from '@/api/client'

export interface UserState {
  id: number
  username: string
  fullName: string
  email: string
  role: string
  roleName: string
  department?: string
  phone?: string
}

export interface AuthState {
  user: UserState | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: Omit<UserState, 'roleName'>, accessToken: string, refreshToken: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'ROLE_ADMIN':
      return 'Administrator'
    case 'ROLE_MANAGER':
      return 'Manager'
    case 'ROLE_USER':
    default:
      return 'User'
  }
}

const getInitialUser = (): UserState | null => {
  try {
    const userJson = sessionStorage.getItem('auth_user')
    if (userJson) {
      const parsed = JSON.parse(userJson)
      return {
        ...parsed,
        roleName: getRoleDisplayName(parsed.role),
      }
    }
  } catch (e) {
    // Ignore
  }
  return null
}

const initialUser = getInitialUser()
const hasToken = !!tokenStorage.getAccessToken()

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser && hasToken,
  isLoading: false,
  login: (userData, accessToken, refreshToken) => {
    tokenStorage.setTokens(accessToken, refreshToken)
    const roleName = getRoleDisplayName(userData.role)
    const userWithRoleName = { ...userData, roleName }
    sessionStorage.setItem('auth_user', JSON.stringify(userWithRoleName))
    set({ user: userWithRoleName, isAuthenticated: true })
  },
  logout: () => {
    tokenStorage.clearAll()
    sessionStorage.removeItem('auth_user')
    set({ user: null, isAuthenticated: false })
  },
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))

export const selectIsAdmin = (state: AuthState) => state.user?.role === 'ROLE_ADMIN'
export const selectIsManagerOrAdmin = (state: AuthState) =>
  state.user?.role === 'ROLE_ADMIN' || state.user?.role === 'ROLE_MANAGER'
