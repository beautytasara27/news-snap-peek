import { useEffect, useState } from "react";
import axios from "axios";


export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}


interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUser = async (token: string) => {
    setLoading(true);
    try {
      const res = await axios.get<ApiResponse<User>>("http://127.0.0.1:5050/api/me", {
        withCredentials: true
      });
      setUser(res.data.data);
    } catch (err) {
      setUser(null);
      console.error("Failed to fetch user", err);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, fetchUser };
}