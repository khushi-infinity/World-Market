import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "../lib/api";
import type { Job, PageResponse } from "../lib/types";
import { REGIONS, SORTS } from "../lib/regions";
import { JobCard } from "../components/JobCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyState, SkeletonCard } from "../components/EmptyState";

export function JobBoard() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [minPurse, setMinPurse] = useState(params.get("min") ?? "");

  const q = params.get("q") ?? "";
  const region = params.get("region") ?? "";
  const type = params.get("type") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Number(params.get("page") ?? 0);

  useEffect(() => {
    setSearch(params.get("q") ?? "");
    setMinPurse(params.get("min") ?? "");
  }, [params]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  };

  const queryString = useMemo(() => {
    const searchParams = new URLSearchParams();
    if (q) searchParams.set("q", q);
    if (region) searchParams.set("region", region);
    if (type) searchParams.set("type", type);
    if (sort) searchParams.set("sort", sort);
    if (params.get("min")) searchParams.set("min", params.get("min") ?? "");
    searchParams.set("page", String(page));
    searchParams.set("size", "9");
    return searchParams.toString();
  }, [q, region, type, sort, page, params]);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", queryString],
    queryFn: () => api<PageResponse<Job>>(`/jobs?${queryString}`),
  });

  const activeFilters = [region, type, params.get("min")].filter(Boolean).length;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    update("q", search.trim());
  };

  return (
    <div>
      <PageHeader
        eyebrow="The open hall"
        title="Decrees seeking hands"
        lede="Every commission below is a written scope with a purse attached. Read the terms, then swear a proposal."
      >
        <form onSubmit={submitSearch} className="max-w-2xl">
          <div className="search-shell">
            <Search size={17} className="shrink-0 text-gold/60" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by craft, skill, or phrase..."
              aria-label="Search decrees"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(""); update("q", ""); }} className="text-parchment/30 hover:text-parchment">
                <X size={15} />
              </button>
            )}
            <button type="submit" className="btn btn-gold !px-4 !py-2.5 !text-[10px]">
              Search
            </button>
          </div>
        </form>
      </PageHeader>

      <div className="container-hall py-10">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
            <div className="panel sticky top-24 p-5">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Refine the search</p>
                <SlidersHorizontal size={14} className="text-gold/50" />
              </div>

              <div className="mt-5">
                <p className="field-label">The hall</p>
                <div className="space-y-1">
                  <button
                    onClick={() => update("region", "")}
                    className={`flex w-full items-center justify-between px-2 py-1.5 text-left text-[11px] transition ${
                      !region ? "bg-gold/10 text-gold-2" : "text-parchment/50 hover:text-parchment"
                    }`}
                  >
                    All halls
                  </button>
                  {REGIONS.map((r) => (
                    <button
                      key={r.name}
                      onClick={() => update("region", region === r.name ? "" : r.name)}
                      className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] transition ${
                        region === r.name ? "bg-gold/10 text-gold-2" : "text-parchment/50 hover:text-parchment"
                      }`}
                    >
                      <r.icon size={12} style={{ color: region === r.name ? undefined : r.accent }} />
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="field-label">Purse type</p>
                <div className="flex gap-1.5">
                  {[
                    { value: "", label: "Any" },
                    { value: "FIXED", label: "Fixed" },
                    { value: "HOURLY", label: "Hourly" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => update("type", item.value)}
                      className={`flex-1 border px-2 py-1.5 text-[9px] uppercase tracking-[0.12em] transition ${
                        type === item.value
                          ? "border-gold/45 bg-gold/10 text-gold-2"
                          : "border-parchment/12 text-parchment/40 hover:border-parchment/25"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="field-label" htmlFor="min-purse">Minimum purse</label>
                <div className="flex gap-1.5">
                  <input
                    id="min-purse"
                    value={minPurse}
                    onChange={(event) => setMinPurse(event.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 2000"
                    className="input !py-2 !text-[12px]"
                  />
                  <button
                    onClick={() => update("min", minPurse)}
                    className="btn btn-ghost !px-3 !py-2 !text-[9px]"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label className="field-label" htmlFor="sort">Order by</label>
                <select id="sort" value={sort} onChange={(event) => update("sort", event.target.value)} className="select !py-2 !text-[12px]">
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {activeFilters > 0 && (
                <button
                  onClick={() => setParams(sort === "newest" ? {} : { sort })}
                  className="mt-6 flex w-full items-center justify-center gap-1.5 border border-parchment/12 py-2 text-[9px] uppercase tracking-[0.14em] text-parchment/40 transition hover:border-crimson/40 hover:text-parchment/70"
                >
                  <X size={11} /> Clear filters
                </button>
              )}

              <div className="mt-6 border-t border-parchment/8 pt-4">
                <p className="text-[10px] leading-relaxed text-parchment/30">
                  Every purse is sealed in escrow before work begins. The guild holds 10% at release.
                </p>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-parchment/40">
                {isLoading ? "Reading the rolls..." : `${data?.totalElements ?? 0} decrees in the hall`}
                {region && <span className="text-gold/70"> in {region}</span>}
                {q && <span className="text-parchment/30"> for "{q}"</span>}
              </p>
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="btn btn-ghost !px-3 !py-2 !text-[9px] lg:hidden"
              >
                <Filter size={12} /> Filters {activeFilters > 0 ? `(${activeFilters})` : ""}
              </button>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : data && data.content.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.content.map((job) => <JobCard key={job.id} job={job} />)}
                </div>

                {data.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      disabled={page === 0}
                      onClick={() => update("page", String(page - 1))}
                      className="btn btn-ghost !px-3 !py-2 disabled:opacity-30"
                      aria-label="Previous page"
                    >
                      <ArrowLeft size={13} />
                    </button>
                    {Array.from({ length: data.totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => update("page", String(index))}
                        className={`h-9 w-9 border text-[11px] transition ${
                          page === index
                            ? "border-gold/50 bg-gold/10 text-gold-2"
                            : "border-parchment/10 text-parchment/40 hover:border-parchment/25"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      disabled={page >= data.totalPages - 1}
                      onClick={() => update("page", String(page + 1))}
                      className="btn btn-ghost !px-3 !py-2 disabled:opacity-30"
                      aria-label="Next page"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No decree answers that search"
                body="The hall is quieter than expected. Try another hall, widen the purse, or post the decree you were hoping to find."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <button onClick={() => setParams({})} className="btn btn-ghost">Clear the search</button>
                    <Link to="/post" className="btn btn-gold">Post a decree</Link>
                  </div>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
