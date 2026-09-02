import { DesktopShell } from "@/components/desktop-shell";

/** The doctor's view is a phone screen too, so it gets the same frame on desktop. */
export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <DesktopShell>{children}</DesktopShell>;
}
