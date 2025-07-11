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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  handleLogin(loginRequest: LoginRequest): Promise<Boolean>;
  registerService: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Só no client side: ler localStorage e atualizar estado user
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      } else {
        setUser(getEmptyUser());
      }
    } catch {
      setUser(getEmptyUser());
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLogin(loginRequest: LoginRequest): Promise<boolean> {
    setLoading(true);
    try {
      const userDTO: User = await login("/auth/login", loginRequest);

      if (!userDTO) {
        throw new Error("Resposta do servidor nula.");
      }

      if (!userDTO.token) {
        throw new Error("Token não encontrado na resposta.");
      }

      const token = userDTO.token.startsWith("Bearer ")
        ? userDTO.token.substring(7)
        : userDTO.token;

      const userData: User = {
        ...userDTO,
        token,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast({
        title: "Login realizado com sucesso!",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description:
          error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
      return false;
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

      const response = await register<User>("/users/register", userToRegister);

      if (response && response.token) {
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

  const contextValue: AuthContextType = {
    user,
    loading,
    handleLogin,
    registerService,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
