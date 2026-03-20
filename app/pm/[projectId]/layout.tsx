import { PmShell } from "./shell";

export default function PmLayout({ children }: { children: React.ReactNode }) {
  return <PmShell>{children}</PmShell>;
}

