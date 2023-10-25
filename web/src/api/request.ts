import Axios from 'axios'

const request = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export default request
