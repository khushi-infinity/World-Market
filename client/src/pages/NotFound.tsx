import { Link } from "react-router-dom";
import { ArrowLeft, Compass, ScrollText } from "lucide-react";
import { Sigil } from "../components/Logo";

export function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 pt-[72px]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(700px 320px at 50% 0%, rgba(201,162,39,0.1), transparent 70%), radial-gradient(600px 300px at 80% 80%, rgba(140,28,28,0.1), transparent 70%)",
        }}
      />
      <div className="relative max-w-lg text-center">
        <span className="inline-flex opacity-60">
          <Sigil size={48} />
        </span>
        <p className="eyebrow mt-6">A hall that is not on the map</p>
        <h1 className="display-section mt-3 text-parchment">This corridor leads nowhere.</h1>
        <p className="serif-lede mt-4">
          The page you asked for is not recorded in the guild ledger. It may have been moved, renamed, or
          never carved at all.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn btn-gold">
            <ArrowLeft size={13} /> Return to the hall
          </Link>
          <Link to="/jobs" className="btn btn-ghost">
            <ScrollText size={13} /> The decree board
          </Link>
          <Link to="/artisans" className="btn btn-quiet">
            <Compass size={13} /> The directory
          </Link>
        </div>
        <p className="mt-8 text-[9px] uppercase tracking-[0.2em] text-parchment/22">Error four hundred and four</p>
      </div>
    </div>
  );
}
