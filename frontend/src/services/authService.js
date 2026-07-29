import api from '../api/axiosInstance'

export const loginUser = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}
