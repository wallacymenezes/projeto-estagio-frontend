import axios, { AxiosResponse } from "axios"

const api = axios.create({
  baseURL: "https://backend-estagio-unisuam.onrender.com",
})

// Tipos genéricos para dados e retorno
type DataObject = Record<string, any>

export const cadastrarUsuario = async <T = any>(url: string, dados: DataObject): Promise<T> => {
  const resposta: AxiosResponse<T> = await api.post(url, dados)
  return resposta.data
}

export const login = async <T = any>(url: string, dados: DataObject): Promise<T> => {
  const resposta: AxiosResponse<T> = await api.post(url, dados)
  return resposta.data
}

export const recovery = async <T = any>(url: string, dados: DataObject): Promise<T> => {
  const resposta: AxiosResponse<T> = await api.post(url, dados)
  return resposta.data
}

export const buscar = async <T = any>(url: string): Promise<T> => {
  const resposta: AxiosResponse<T> = await api.get(url)
  return resposta.data
}

export const register = async <T = any>(url: string, dados: DataObject): Promise<T> => {
  const resposta: AxiosResponse<T> = await api.post(url, dados)
  return resposta.data
}

export const atualizar = async <T = any>(url: string, dados: DataObject): Promise<T> => {
  const resposta: AxiosResponse<T> = await api.put(url, dados)
  return resposta.data
}

export const deletar = async (url: string): Promise<void> => {
  await api.delete(url)
}
