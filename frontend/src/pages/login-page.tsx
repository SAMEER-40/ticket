import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router";

const LoginPage: React.FC = () => {
  const { isLoading, isAuthenticated, signinRedirect } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      const redirectPath =
        (location.state as { from?: { pathname?: string; search?: string } })
          ?.from;
      if (redirectPath?.pathname) {
        localStorage.setItem(
          "redirectPath",
          redirectPath.pathname + (redirectPath.search ?? ""),
        );
      }
      signinRedirect();
    }
  }, [isLoading, isAuthenticated, signinRedirect, location.state]);

  return <div>Redirecting to login...</div>;
};

export default LoginPage;
