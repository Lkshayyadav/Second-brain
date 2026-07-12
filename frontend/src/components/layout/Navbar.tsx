import { Link } from "react-router-dom";
import { Button } from "../ui/Button";
import { useTheme } from "../../contexts/ThemeContext";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-brand-border bg-brand-secondary px-6 py-4 transition-colors duration-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="text-base font-black text-brand-text tracking-tight flex items-center gap-1.5">
          <span>🧠</span>
          <span>Brainly</span>
        </Link>
        <nav className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 hover:bg-brand-primary text-brand-sub hover:text-brand-text rounded-lg border border-brand-borderAccent transition-colors duration-200 focus:outline-none"
            title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Link to="/signin">
            <Button title="Login" variant="secondary" size="md" />
          </Link>
          <Link to="/signup">
            <Button title="Get Started" variant="primary" size="md" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
