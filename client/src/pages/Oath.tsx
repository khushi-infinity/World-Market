import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Coins,
  Gavel,
  Lock,
  ScrollText,
  ShieldCheck,
  Upload,
  Vault,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Sigil } from "../components/Logo";

const STEPS = [
  {
    icon: ScrollText,
    title: "The decree is posted",
    body: "A patron names the outcome, the purse, the skills, and the date. The board shows it to the whole hall.",
  },
  {
    icon: CheckCircle2,
    title: "An oath is accepted",
    body: "Artisans answer with a proposal. The patron accepts one. Every other pending proposal is declined at once.",
  },
  {
    icon: Lock,
    title: "The vault is sealed",
    body: "The patron funds the full contract sum. The coin leaves the purse and is held by the guild, not by the artisan.",
  },
  {
    icon: Upload,
    title: "The work is delivered",
    body: "The artisan presents a note and a link in the contract room. Delivery hands the seal to the patron.",
  },
  {
    icon: Vault,
    title: "The seal is broken",
    body: "The patron inspects and releases. The artisan receives the agreed amount, the guild keeps its tithe, the ledger records both.",
  },
];

export function Oath() {
  return (
    <div>
      <PageHeader
        eyebrow="The oath of Emberhall"
        title="A promise is only as good as the vault behind it."
        lede="These are the rules every patron and artisan agrees to when they enter the hall. They are short on purpose, and they do not bend quietly."
      >
        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-parchment/35">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-gold/60" /> Escrow on every contract
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Coins size={11} className="text-gold/60" /> Ten percent tithe
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gavel size={11} className="text-gold/60" /> Wardens rule on disputes
          </span>
        </div>
      </PageHeader>

      <div className="container-hall grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section id="escrow" className="panel p-6 sm:p-8">
            <p className="eyebrow">One · The vault</p>
            <h2 className="mt-2 font-display text-2xl text-parchment">Coin is held, never sent ahead.</h2>
            <p className="prose-lore mt-4">
              When a patron accepts a proposal, the hall opens a contract and a vault. The patron seals the full
              sum, which is the agreed amount plus the guild tithe, before the artisan is asked to begin. That
              coin is held by the guild and shown to the artisan as sealed. It is not a promise of future
              payment. It is payment, waiting for the work.
            </p>
            <p className="prose-lore mt-3">
              If the vault is never sealed, the contract does not begin. No artisan is expected to lift a tool
              against an empty vault, and no patron is asked to pay for work they have not seen.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/jobs" className="btn btn-gold">
                See the board <ArrowRight size={12} />
              </Link>
              <Link to="/counsel" className="btn btn-ghost">
                Ask the Oracle about escrow
              </Link>
            </div>
          </section>

          <section className="panel p-6 sm:p-8">
            <p className="eyebrow">Two · The shape of an oath</p>
            <h2 className="mt-2 font-display text-2xl text-parchment">Five movements, in order.</h2>
            <div className="timeline mt-6">
              {STEPS.map((step, index) => (
                <div key={step.title} className={`timeline-item ${index < STEPS.length - 1 ? "done" : "current"}`}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-gold/70">
                      <step.icon size={15} />
                    </span>
                    <div>
                      <p className="font-display text-[15px] text-parchment">{step.title}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-parchment/42">{step.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="fees" className="panel p-6 sm:p-8">
            <p className="eyebrow">Three · Fees and release</p>
            <h2 className="mt-2 font-display text-2xl text-parchment">One tithe, named before the oath.</h2>
            <p className="prose-lore mt-4">
              The guild keeps ten percent of the agreed contract amount. The tithe is calculated when the
              proposal is accepted and shown in the contract room before the vault is sealed, so no one is
              surprised at the end. The artisan receives the full agreed amount. The patron pays the agreed
              amount plus the tithe.
            </p>

            <div className="mt-6 overflow-hidden border border-gold/15">
              <table className="table-lore">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Who pays</th>
                    <th className="text-right">Example on a $2,000 oath</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Agreed amount</td>
                    <td className="text-parchment/55">Patron, into escrow</td>
                    <td className="text-right">$2,000</td>
                  </tr>
                  <tr>
                    <td>Guild tithe, ten percent</td>
                    <td className="text-parchment/55">Patron, into escrow</td>
                    <td className="text-right">$200</td>
                  </tr>
                  <tr>
                    <td className="text-gold-2">Sealed in the vault</td>
                    <td className="text-parchment/55">Held by the guild</td>
                    <td className="text-right text-gold-2">$2,200</td>
                  </tr>
                  <tr>
                    <td>Artisan receives at release</td>
                    <td className="text-parchment/55">From the vault</td>
                    <td className="text-right">$2,000</td>
                  </tr>
                  <tr>
                    <td>Guild keeps</td>
                    <td className="text-parchment/55">At release</td>
                    <td className="text-right">$200</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-parchment/32">
              Release is the patron's act alone. The artisan cannot open the vault, and the guild does not open it
              on the patron's behalf except after a warden ruling.
            </p>
          </section>

          <section id="disputes" className="panel p-6 sm:p-8">
            <p className="eyebrow">Four · Disputes and wardens</p>
            <h2 className="mt-2 font-display text-2xl text-parchment">When the oath is contested.</h2>
            <p className="prose-lore mt-4">
              Either side may raise a dispute while the vault is sealed or after delivery. A dispute freezes the
              vault at once. The reason is recorded in the contract room and a warden reviews the decree, the
              delivery, and the thread between the parties.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="border border-parchment/10 p-4">
                <p className="flex items-center gap-2 text-[11.5px] font-medium text-parchment/80">
                  <AlertTriangle size={13} className="text-[#c98a8a]" /> What a warden can do
                </p>
                <ul className="mt-2 space-y-1.5 text-[10.5px] leading-relaxed text-parchment/38">
                  <li>Release the vault in full to the artisan.</li>
                  <li>Return the vault in full to the patron.</li>
                  <li>Split the vault at a stated proportion.</li>
                  <li>Order a defined correction before release.</li>
                </ul>
              </div>
              <div className="border border-parchment/10 p-4">
                <p className="flex items-center gap-2 text-[11.5px] font-medium text-parchment/80">
                  <ShieldCheck size={13} className="text-gold/70" /> What a warden will read
                </p>
                <ul className="mt-2 space-y-1.5 text-[10.5px] leading-relaxed text-parchment/38">
                  <li>The original decree and its acceptance criteria.</li>
                  <li>The delivery note and any attached work.</li>
                  <li>The full contract thread, in order.</li>
                  <li>Any prior chronicle between the parties.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="panel p-6 sm:p-8">
            <p className="eyebrow">Five · The code</p>
            <h2 className="mt-2 font-display text-2xl text-parchment">What the hall expects of you.</h2>
            <div className="mt-5 space-y-3">
              {[
                "Say what you will do, and do what you said. Scope changes are agreed in writing before the work continues.",
                "Do not ask for payment outside the vault. Off ledger payment removes every protection the hall offers.",
                "Deliver work you have the right to deliver. Name third party assets and licenses in the delivery note.",
                "Keep the thread civil. A warden reads it, and a future patron may too.",
                "Do not open a dispute to gain leverage. It freezes the coin for both sides, including yours.",
              ].map((line) => (
                <p key={line} className="flex items-start gap-3 text-[12px] leading-relaxed text-parchment/45">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-gold/55" />
                  {line}
                </p>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center gap-3">
              <Sigil size={30} />
              <div>
                <p className="font-display text-[13px] tracking-[0.12em] text-parchment">THE GUILD SEAL</p>
                <p className="text-[9px] uppercase tracking-[0.16em] text-parchment/30">Established in the hall</p>
              </div>
            </div>
            <p className="mt-4 font-serif text-[14px] leading-relaxed text-parchment/45">
              "We do not ask for trust. We ask for a vault, a written oath, and the patience to inspect the work
              before the seal is broken."
            </p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-gold/50">The warden's charge</p>
          </section>

          <section className="panel p-5">
            <p className="eyebrow">On this page</p>
            <div className="mt-3 space-y-1.5">
              {[
                { href: "#escrow", label: "The vault" },
                { href: "#fees", label: "Fees and release" },
                { href: "#disputes", label: "Disputes and wardens" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block border-b border-parchment/6 py-2 text-[11.5px] text-parchment/50 transition hover:text-gold"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <p className="eyebrow">Ready to swear</p>
            <p className="mt-2 text-[11px] leading-relaxed text-parchment/40">
              Post a decree, answer one, or open the contract room and read the terms before you commit.
            </p>
            <div className="mt-4 space-y-2">
              <Link to="/post" className="btn btn-gold w-full">
                Post a decree
              </Link>
              <Link to="/jobs" className="btn btn-ghost w-full">
                Answer a decree
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
