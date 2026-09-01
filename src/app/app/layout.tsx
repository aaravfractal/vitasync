import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="screen">{children}</main>
      <BottomNav />
    </>
  );
}
