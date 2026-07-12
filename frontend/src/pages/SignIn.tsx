import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { authService } from "../services/auth.service";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

export function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
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
      const response = await authService.signin({ username, password });
      localStorage.setItem("username", username);
      login(response.token);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid username or password");
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
          <h1 className="text-xl font-black tracking-tight uppercase text-brand-text">Sign In</h1>
        </div>
        <p className="text-xs font-bold text-brand-muted uppercase tracking-wider">
          Access your Second Brain workspace
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <fieldset disabled={loading} className="space-y-4">
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={setUsername}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
            />
            {error && <div className="text-xs font-semibold text-red-500">{error}</div>}
            <div className="pt-2">
              <Button
                title="Sign In"
                variant="primary"
                size="md"
                type="submit"
                loading={loading}
              />
            </div>
          </fieldset>
        </form>
        <p className="mt-5 text-xs text-brand-sub font-semibold">
          New here?{" "}
          <Link to="/signup" className="text-brand-accent hover:text-brand-accentHover underline font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignInPage;
