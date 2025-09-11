import React, { useState } from "react";
import axios from "axios";
import { useCurrentUser } from "@/hooks/use-curr-user";
interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pageLoading, setLoading] = useState(false);
  const { user, loading, fetchUser } = useCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5050/api/register",
        {
          firstName,
          lastName,
          email,
          password,
        },
        {
          withCredentials: true, 
        }
      );
      console.log("reg response", response);
      fetchUser(response.data.token);
      alert("Registered successfully!");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold text-center">Register</h2>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="border p-2 rounded"
        required
      />
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
        {pageLoading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
