import React, { useState } from "react";
import { toast } from "sonner";
import { AuthField, AuthSubmit } from "@/components/AuthField";
import { useAuth } from "@/context/AuthContext";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitch?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitch }) => {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const user = await register({ firstName, lastName, email, password });
      toast.success(`You're in, ${user.firstName}`);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="-mt-2 text-sm text-news-subtle">
        Your likes stay with your account and shape what we recommend next.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <AuthField
          label="First name"
          autoComplete="given-name"
          placeholder="Ada"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
        />
        <AuthField
          label="Last name"
          autoComplete="family-name"
          placeholder="Lovelace"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required
        />
      </div>

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
        autoComplete="new-password"
        placeholder="At least 8 characters"
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      {error && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <AuthSubmit pending={pending} pendingLabel="Creating account...">
        Create account
      </AuthSubmit>

      {onSwitch && (
        <p className="text-center text-sm text-news-subtle">
          Already have an account?{" "}
          <button type="button" onClick={onSwitch} className="focus-ring rounded font-medium text-primary hover:underline">
            Sign in
          </button>
        </p>
      )}
    </form>
  );
};

export default RegisterForm;
