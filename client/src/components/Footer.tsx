import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { REGIONS } from "../lib/regions";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-gold/12 bg-[#080706]">
      <div className="container-hall py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs font-serif text-[15px] leading-relaxed text-parchment/45">
              A guild market for independent craft. The coin sits in a sealed vault until the work is
              delivered, and every oath is kept in writing.
            </p>
            <div className="mt-5 flex items-center gap-3 text-[9px] uppercase tracking-[0.18em] text-parchment/25">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-moss" />
              The hall is open
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">The Hall</p>
            <ul className="space-y-2.5 text-[12px] text-parchment/45">
              <li><Link to="/jobs" className="hover:text-gold-2">Browse decrees</Link></li>
              <li><Link to="/artisans" className="hover:text-gold-2">The directory</Link></li>
              <li><Link to="/post" className="hover:text-gold-2">Post a decree</Link></li>
              <li><Link to="/counsel" className="hover:text-gold-2">The Oracle</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">The Six Halls</p>
            <ul className="space-y-2.5 text-[12px] text-parchment/45">
              {REGIONS.slice(0, 5).map((region) => (
                <li key={region.name}>
                  <Link to={`/jobs?region=${encodeURIComponent(region.name)}`} className="hover:text-gold-2">
                    {region.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">The Oath</p>
            <ul className="space-y-2.5 text-[12px] text-parchment/45">
              <li><Link to="/oath" className="hover:text-gold-2">How escrow works</Link></li>
              <li><Link to="/oath" className="hover:text-gold-2">Fees and release</Link></li>
              <li><Link to="/oath" className="hover:text-gold-2">Disputes and wardens</Link></li>
              <li>
                <a href="https://developer.paypal.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-gold-2">
                  PayPal developer <ArrowUpRight size={10} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-parchment/8 pt-6 text-[10px] text-parchment/25 sm:flex-row sm:items-center">
          <p>Emberhall is a demonstration marketplace. Coin and contracts are sandbox only.</p>
          <p className="tracking-[0.16em] uppercase">Built for the PayPal AI Hackathon</p>
        </div>
      </div>
    </footer>
  );
}
