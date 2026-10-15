import React, { useState } from "react";
import { toast } from "sonner";
import { AuthField, AuthSubmit } from "@/components/AuthField";
import { useAuth } from "@/context/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitch?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitch }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.firstName}`);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign you in");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="-mt-2 text-sm text-news-subtle">
        Sign in to like articles and get recommendations tuned to your taste.
      </p>

      <AuthField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <AuthField
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <AuthSubmit pending={pending} pendingLabel="Signing in...">
        Sign in
      </AuthSubmit>

      {onSwitch && (
        <p className="text-center text-sm text-news-subtle">
          New here?{" "}
          <button type="button" onClick={onSwitch} className="focus-ring rounded font-medium text-primary hover:underline">
            Create an account
          </button>
        </p>
      )}
    </form>
  );
};

export default LoginForm;
