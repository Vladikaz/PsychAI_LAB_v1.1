interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground font-medium tracking-wide">
            Vladimir Kazantsev | v1.0
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-4">
        <div className="container mx-auto px-6">
          <p className="text-xs text-muted-foreground text-center">
            Disclaimer: AI-generated insights are for guidance only; please cross-reference with professional school counseling standards.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
