import { SearchBar } from "../components/SearchBar";
export function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-blue-200">
      <div className="flex flex-col items-center gap-8 p-8 rounded-3xl shadow-xl bg-white/80 backdrop-blur-md">
        <h1 className="font-extrabold text-4xl md:text-6xl text-blue-700 drop-shadow-lg tracking-tight">
          FreeMarket
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 font-medium mb-2 text-center max-w-xl">
          Encuentra productos de manera rápida y sencilla. Solo busca lo que
          necesitas.
        </p>
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      </div>
    </main>
  );
}
