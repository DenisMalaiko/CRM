import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { JSX } from "react";

type Props = {
  children: JSX.Element;
};

function Guard({ children }: Props) {
  const isAuthenticated = useSelector((state: any) => state.authModule.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/signIn" replace />;
  }

  return children;
}

export default Guard;