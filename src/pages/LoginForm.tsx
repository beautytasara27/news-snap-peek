import React, { useState } from "react";
import axios from "axios";
import { useCurrentUser } from "@/hooks/use-curr-user";


interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pageLoading, setLoading] = useState(false);
  const {loading, fetchUser} = useCurrentUser();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5050/api/login", { email, password }, {
        withCredentials: true, 
      });
      alert("Logged in successfully!");
      console.log("reg response", response);
      fetchUser(response.data.token);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-center">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        disabled={pageLoading}
      >
        {pageLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
