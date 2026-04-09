import { useEffect, useState } from "react";
import { useAuth } from "@/auth/auth-context";
import { useLocation, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginPage: React.FC = () => {
  const { isLoading, isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      await login(username, password);
      const redirectPath =
        (location.state as { from?: { pathname?: string; search?: string } })?.from;
      navigate(redirectPath?.pathname ? redirectPath.pathname + (redirectPath.search ?? "") : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleLogin} className="surface-card w-full max-w-md space-y-4 border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-600">Use demo users (e.g. `organizer.demo` / `demo123`).</p>
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full">Log in</Button>
      </form>
    </div>
  );
};

export default LoginPage;
