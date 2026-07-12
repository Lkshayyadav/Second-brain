import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

const features = [
  "Store YouTube, GitHub, Twitter & PDFs in one hub",
  "Keep your notes and documents organized",
  "Instant visual previews with live website snapshots",
  "Notion-style tags and collapsible custom collections",
  "Estimate reading time automatically",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-primary text-brand-text flex flex-col justify-between transition-colors duration-250">
      <div>
        <Navbar />
        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
          {/* Hero segment */}
          <section className="grid gap-10 rounded-premium border border-brand-border bg-brand-secondary p-8 shadow-premium-lg lg:grid-cols-[1.2fr_0.8fr] lg:p-12 animate-fade-in">
            <div className="space-y-6 flex flex-col justify-center">
              <span className="inline-block bg-brand-accentLight text-brand-accent border border-brand-accent/25 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest self-start">
                Beta Version 1.0
              </span>
              <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-brand-text">
                Organize your digital mind with Brainly
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-brand-sub font-semibold">
                A premium, modern SaaS workspace built for productivity. Safely store resources, articles, notes, and media to retrieve them instantly.
              </p>
              <div className="flex gap-3">
                <Link to="/signup">
                  <Button title="Get Started Free" variant="primary" size="md" />
                </Link>
                <Link to="/signin">
                  <Button title="Open Workspace" variant="secondary" size="md" />
                </Link>
              </div>
            </div>
            <div className="rounded-premium bg-brand-primary p-6 border border-brand-border flex flex-col justify-between">
              <div>
                <h2 className="mb-4 text-xs font-black uppercase text-brand-text tracking-widest">
                  Why Brainly
                </h2>
                <ul className="space-y-3 text-xs text-brand-sub font-semibold">
                  {features.map((feature, i) => (
                    <li key={i} className="rounded-lg border border-brand-border bg-brand-secondary px-3.5 py-2 flex items-center gap-2">
                      <span className="text-brand-accent font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Cards feature layout */}
          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-premium border border-brand-border bg-brand-secondary p-6 shadow-premium-sm">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-brand-text">Instant Preview</h3>
              <p className="mt-2 text-xs text-brand-sub leading-relaxed font-semibold">
                No more blind links. Instantly watch YouTube streams or view PDF content right inside your dashboard.
              </p>
            </div>
            <div className="rounded-premium border border-brand-border bg-brand-secondary p-6 shadow-premium-sm">
              <div className="text-2xl mb-2">📂</div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-brand-text">Smart Collections</h3>
              <p className="mt-2 text-xs text-brand-sub leading-relaxed font-semibold">
                Structure your saved assets into Notion-style custom folders, tag hierarchies, and status workflows.
              </p>
            </div>
            <div className="rounded-premium border border-brand-border bg-brand-secondary p-6 shadow-premium-sm">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-brand-text">Premium UI/UX</h3>
              <p className="mt-2 text-xs text-brand-sub leading-relaxed font-semibold">
                Sleek dark and light themes designed to match Linear and Obsidian, making organization a daily habit.
              </p>
            </div>
          </section>
        </main>
      </div>

      <footer className="border-t border-brand-border bg-brand-secondary px-6 py-6 text-center text-[10px] text-brand-muted font-bold uppercase tracking-wider">
        Brainly © {new Date().getFullYear()} &bull; All Rights Reserved.
      </footer>
    </div>
  );
}

export default LandingPage;
