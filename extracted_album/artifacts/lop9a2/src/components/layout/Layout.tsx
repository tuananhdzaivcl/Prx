import { Navbar } from "./Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#fdfbf7] selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border/40 bg-background mt-auto">
        <p>Kỷ Niệm Lớp 9A2 &copy; {new Date().getFullYear()}</p>
        <p className="mt-1 opacity-70">Thanh Xuân Còn Mãi</p>
      </footer>
    </div>
  );
}
