import { toast } from "@/components/ui/use-toast"

interface ApiError {
  response?: {
    data?: {
      message?: string
      error?: string
    }
    status?: number
  }
  message?: string
}

export function handleApiError(error: ApiError, defaultMessage: string): void {
  console.error("API Error:", error)

  // Get the error message from the API response if available
  const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || defaultMessage

  // Show toast with error message
  toast({
    title: "Erro",
    description: errorMessage,
    variant: "destructive",
  })

  // Handle specific status codes
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem("token")
    window.location.href = "/login"
  }
}
