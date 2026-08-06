import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/marine/", label: "Marine" },
  { href: "/tools/", label: "Tools" },
  { href: "/github/", label: "GitHub Projects" }
];

export function SiteShell({ children }: { children: ReactNode }) {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return (
    <div className="site-shell">
      <header className="global-header">
        <a className="site-name" href="/">Kevin Johnston</a>
        <nav aria-label="Main navigation">
          {links.map((link) => {
            const target = link.href.replace(/\/+$/, "") || "/";
            return <a key={link.href} href={link.href} aria-current={path === target ? "page" : undefined}>{link.label}</a>;
          })}
        </nav>
      </header>
      {children}
      <footer className="global-footer">kevin-m-johnston.github.io</footer>
    </div>
  );
}
