export const isAuthenticated = () => Boolean(localStorage.getItem('token'))

export const saveSession = (data) => {
  const token = data.token || data.accessToken
  if (token) localStorage.setItem('token', token)
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
}

export const clearSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
