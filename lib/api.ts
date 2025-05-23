"use client"

import axios from "axios"

// Criar uma instância do axios com configurações padrão
export const api = axios.create({
  baseURL: 'https://backend-estagio-unisuam.onrender.com',
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Se o erro for 401 (Unauthorized), redirecionar para o login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

export default api
