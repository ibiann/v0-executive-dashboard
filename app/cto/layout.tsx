import { CtoShell } from "./shell";

export default function CtoLayout({ children }: { children: React.ReactNode }) {
  return <CtoShell>{children}</CtoShell>;
}
