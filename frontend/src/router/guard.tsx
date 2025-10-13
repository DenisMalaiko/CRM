import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { JSX } from "react";

type Props = {
  children: JSX.Element;
};

export function Guard({ children }: Props) {
  const isAuthenticated = useSelector((state: any) => state.authModule.isAuthenticatedUser);

  if (!isAuthenticated) {
    return <Navigate to="/signIn" replace />;
  }

  return children;
}

export function AdminGuard({ children }: Props) {
  const isAuthenticated = useSelector((state: any) => state.adminModule.isAuthenticatedAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/signIn" replace />;
  }

  return children;
}