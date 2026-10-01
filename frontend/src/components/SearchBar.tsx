import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  return (
    <form
      className="flex items-center gap-2 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) {
          navigate(`/products?q=${encodeURIComponent(query)}`);
        }
      }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
        className="flex-1 min-w-0 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full border-2 border-input bg-background text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-base sm:text-lg"
      />
      <button
        type="submit"
        className="shrink-0 px-3 py-2.5 sm:px-5 sm:py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 font-semibold transition-colors"
        aria-label="Buscar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 sm:w-6 sm:h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
          />
        </svg>
      </button>
    </form>
  );
}
