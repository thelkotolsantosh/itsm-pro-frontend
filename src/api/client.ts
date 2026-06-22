import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

export const tokenStorage = {
  getAccessToken: () => sessionStorage.getItem('access_token'),
  getRefreshToken: () => sessionStorage.getItem('refresh_token'),
  setTokens: (accessToken: string, refreshToken: string) => {
    sessionStorage.setItem('access_token', accessToken)
    sessionStorage.setItem('refresh_token', refreshToken)
  },
  clearAll: () => {
    sessionStorage.removeItem('access_token')
    sessionStorage.removeItem('refresh_token')
  }
}

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token)
    } else {
      prom.reject(error)
    }
  })
  failedRequestsQueue = []
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config
    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isRefreshRequest = originalRequest.url === '/auth/refresh'

    if (error.response?.status === 401 && !originalRequest.headers.get('_retry') && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(apiClient(originalRequest))
            },
            reject: (err: unknown) => {
              reject(err)
            }
          })
        })
      }

      if (originalRequest.headers) {
        originalRequest.headers.set('_retry', 'true')
      }
      isRefreshing = true

      const refreshToken = tokenStorage.getRefreshToken()
      if (!refreshToken) {
        tokenStorage.clearAll()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post<{ accessToken: string; refreshToken: string }>(
          '/api/auth/refresh',
          { refreshToken }
        )
        const { accessToken, refreshToken: newRefreshToken } = response.data
        tokenStorage.setTokens(accessToken, newRefreshToken || refreshToken)
        
        processQueue(null, accessToken)
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenStorage.clearAll()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
