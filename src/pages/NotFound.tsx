import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen grid place-items-center bg-gray-950 text-gray-100 p-6">
      <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-100 text-sm">
          404 · Not Found
        </p>
        <h1 className="text-3xl font-extrabold mt-3 mb-2">Page introuvable</h1>
        <p className="text-gray-300">
          L’URL <code className="text-gray-100">{pathname}</code> n’existe pas.
        </p>
        <div className="mt-5 flex gap-3">
          <Link to="/" className="px-4 py-2 rounded-lg bg-cyan-400 text-gray-900 font-semibold">← Accueil</Link>
          <button onClick={() => history.back()} className="px-4 py-2 rounded-lg border border-white/20">Revenir</button>
        </div>
      </div>
    </div>
  );
}
