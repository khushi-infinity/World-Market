import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Search, Sparkles, X } from "lucide-react";
import { api } from "../lib/api";
import type { PageResponse, UserSummary } from "../lib/types";
import { REGIONS } from "../lib/regions";
import { ArtisanCard } from "../components/ArtisanCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { SkeletonCard } from "../components/EmptyState";

export function Artisans() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");

  const q = params.get("q") ?? "";
  const region = params.get("region") ?? "";
  const sort = params.get("sort") ?? "rating";
  const page = Number(params.get("page") ?? 0);

  useEffect(() => {
    setSearch(params.get("q") ?? "");
  }, [params]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const queryString = new URLSearchParams();
  if (q) queryString.set("q", q);
  if (region) queryString.set("region", region);
  queryString.set("sort", sort);
  queryString.set("page", String(page));
  queryString.set("size", "9");

  const { data, isLoading } = useQuery({
    queryKey: ["artisans", queryString.toString()],
    queryFn: () => api<PageResponse<UserSummary>>(`/artisans?${queryString.toString()}`),
  });

  return (
    <div>
      <PageHeader
        eyebrow="The directory"
        title="Masters of their halls"
        lede="Every artisan here has a public chronicle. Read the record, check the rate, then open a raven thread."
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            update("q", search.trim());
          }}
          className="max-w-2xl"
        >
          <div className="search-shell">
            <Search size={17} className="shrink-0 text-gold/60" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a name, craft, or skill..."
              aria-label="Search artisans"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(""); update("q", ""); }} className="text-parchment/30 hover:text-parchment">
                <X size={15} />
              </button>
            )}
            <button type="submit" className="btn btn-gold !px-4 !py-2.5 !text-[10px]">Search</button>
          </div>
        </form>
      </PageHeader>

      <div className="container-hall py-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => update("region", "")}
              className={`border px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] transition ${
                !region ? "border-gold/45 bg-gold/10 text-gold-2" : "border-parchment/12 text-parchment/40 hover:border-parchment/25"
              }`}
            >
              All halls
            </button>
            {REGIONS.map((r) => (
              <button
                key={r.name}
                onClick={() => update("region", region === r.name ? "" : r.name)}
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] transition ${
                  region === r.name ? "border-gold/45 bg-gold/10 text-gold-2" : "border-parchment/12 text-parchment/40 hover:border-parchment/25"
                }`}
              >
                <r.icon size={11} style={{ color: region === r.name ? undefined : r.accent }} />
                {r.short}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-parchment/30">Order</span>
            <select value={sort} onChange={(event) => update("sort", event.target.value)} className="select !w-auto !py-1.5 !text-[11px]">
              <option value="rating">Highest oath</option>
              <option value="rate_high">Highest rate</option>
              <option value="rate_low">Lowest rate</option>
              <option value="newest">Newest member</option>
            </select>
          </div>
        </div>

        <p className="mb-5 text-[11px] text-parchment/35">
          {isLoading ? "Reading the rolls..." : `${data?.totalElements ?? 0} sworn artisans`}
          {region && <span className="text-gold/70"> in {region}</span>}
        </p>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : data && data.content.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.content.map((artisan) => <ArtisanCard key={artisan.id} artisan={artisan} />)}
            </div>
            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button disabled={page === 0} onClick={() => update("page", String(page - 1))} className="btn btn-ghost !px-3 !py-2 disabled:opacity-30">
                  <ArrowLeft size={13} />
                </button>
                {Array.from({ length: data.totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => update("page", String(index))}
                    className={`h-9 w-9 border text-[11px] ${
                      page === index ? "border-gold/50 bg-gold/10 text-gold-2" : "border-parchment/10 text-parchment/40"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button disabled={page >= data.totalPages - 1} onClick={() => update("page", String(page + 1))} className="btn btn-ghost !px-3 !py-2 disabled:opacity-30">
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No artisan answers that search"
            body="Try a broader craft, another hall, or open a decree and let the guild come to you."
            action={<Link to="/post" className="btn btn-gold">Post a decree</Link>}
          />
        )}

        <div className="ornate-frame mt-12 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="oracle-orb !h-10 !w-10"><Sparkles size={16} /></span>
            <div>
              <p className="font-display text-[15px] text-parchment">Are you the craft the hall is missing?</p>
              <p className="mt-1 text-[12px] text-parchment/40">
                Join as an artisan, publish your chronicle, and let patrons find you.
              </p>
            </div>
          </div>
          <Link to="/join" className="btn btn-gold">Join as an artisan</Link>
        </div>
      </div>
    </div>
  );
}
