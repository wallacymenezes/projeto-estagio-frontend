"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/models/User";
import { LoginRequest } from "@/models/Login";
import { login, register } from "@/Service/Service";
import { toast } from "@/hooks/use-toast";
import { set } from "date-fns";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  handleLogin(loginRequest: LoginRequest): Promise<void>;
  registerService: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        return getEmptyUser();
      }
    } else {
      return getEmptyUser();
    }
  });

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  //const [isLoading, setIsLoading] = useState(false);
  const authenticated = !!user?.token;

  async function handleLogin(loginRequest: LoginRequest) {
    setLoading(true);
    try {
      // Agora response é do tipo User
      const userDTO: User = await login("/auth/login", loginRequest);

      if (!userDTO) {
        throw new Error("Resposta do servidor nula.");
      }

      if (!userDTO.token) {
        throw new Error("Token não encontrado na resposta.");
      }

      // Remove o prefixo "Bearer " do token, se existir
      const token = userDTO.token.startsWith("Bearer ")
        ? userDTO.token.substring(7)
        : userDTO.token;

      const userData: User = {
        ...userDTO,
        token: token,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast({
        title: "Login realizado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description:
          error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const registerService = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const userToRegister = {
        name,
        email,
        password,
        photo: "",
        registrationMethod: "OWN",
      };

      // Aguarda a resposta da API
      const response = await register<User>("/users/register", userToRegister);

      if (response && response.token) {
        // Remove "Bearer " do token, se existir
        const token = response.token.startsWith("Bearer ")
          ? response.token.substring(7)
          : response.token;

        const userData: User = {
          ...response,
          token,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        toast({
          title: "Cadastro realizado com sucesso!",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Faça login para acessar sua conta.",
        });
        router.push("/login");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  function getEmptyUser(): User {
    return {
      userId: "",
      name: "",
      email: "",
      password: undefined,
      photo: undefined,
      registrationMethod: undefined,
      token: "",
      earnings: [],
      expenses: [],
      investments: [],
      objectives: [],
    };
  }

  // Provide a default value during server-side rendering
  const contextValue: AuthContextType = {
    user,
    loading,
    handleLogin,
    registerService,
    logout,
  };

  // Only render children when mounted on client side
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
