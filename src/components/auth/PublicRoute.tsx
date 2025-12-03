import type { ReactNode } from "react";
import { useAppSelector } from "../../store/store";

interface Props {
  children: ReactNode;
}

export const PublicRoute = ({ children }: Props) => {
  const { initialized } = useAppSelector((s) => s.auth);

  if (!initialized) return <div>Loading...</div>;


  return <>{children}</>;
};