import api from '../api/axiosInstance'

export const getEquipment = async () => {
  const { data } = await api.get('/equipment')
  return data
}
