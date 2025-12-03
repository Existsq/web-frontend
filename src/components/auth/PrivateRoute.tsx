import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/store";

interface Props {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: Props) => {
  const { user, initialized } = useAppSelector((s) => s.auth);

  if (!initialized) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};