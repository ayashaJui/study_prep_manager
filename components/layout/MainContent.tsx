import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  return (
    <main
      className="flex-1 !p-4 overflow-y-auto"
      style={{ background: "#0f1419" }}
    >
      {children}
    </main>
  );
}
