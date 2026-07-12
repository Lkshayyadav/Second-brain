import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { authService } from "../services/auth.service";
import axios from "axios";

export function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authService.signup({ username, password });
      navigate("/signin");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-primary text-brand-text px-4 transition-colors duration-200">
      <div className="w-full max-w-md rounded-premium border border-brand-border bg-brand-secondary p-8 shadow-premium-lg animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🧠</span>
          <h1 className="text-xl font-black tracking-tight uppercase text-brand-text">Create Account</h1>
        </div>
        <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">
          Establish your Second Brain node
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <fieldset disabled={loading} className="space-y-4">
            <Input
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChange={setUsername}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Choose a password (min 6 characters)"
              value={password}
              onChange={setPassword}
            />
            {error && <div className="text-xs font-semibold text-red-500">{error}</div>}
            <div className="pt-2">
              <Button
                title="Create Account"
                variant="primary"
                size="md"
                type="submit"
                loading={loading}
              />
            </div>
          </fieldset>
        </form>
        <p className="mt-5 text-xs text-brand-sub font-semibold">
          Already have an account?{" "}
          <Link to="/signin" className="text-brand-accent hover:text-brand-accentHover underline font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
