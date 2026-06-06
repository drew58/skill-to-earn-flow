import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type LiveJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: "RemoteOK" | "Remotive";
  tags: string[];
  salary?: string;
  postedAt?: string;
  logo?: string;
  description?: string;
};

const inputSchema = z.object({
  query: z.string().trim().max(120).optional().default(""),
  limit: z.number().int().min(1).max(50).optional().default(24),
});

type RemoteOk = {
  id?: string | number;
  slug?: string;
  position?: string;
  company?: string;
  location?: string;
  url?: string;
  apply_url?: string;
  tags?: string[];
  salary_min?: number;
  salary_max?: number;
  date?: string;
  company_logo?: string;
  description?: string;
};

type Remotive = {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  url: string;
  tags?: string[];
  salary?: string;
  publication_date?: string;
  company_logo?: string;
  description?: string;
};

async function fetchRemoteOK(query: string): Promise<LiveJob[]> {
  try {
    const res = await fetch(
      query ? `https://remoteok.com/api?tag=${encodeURIComponent(query)}` : "https://remoteok.com/api",
      { headers: { "User-Agent": "AngieAI/1.0 (https://skill-to-earn-flow.lovable.app)" } },
    );
    if (!res.ok) return [];
    const raw = (await res.json()) as RemoteOk[];
    // First element is metadata
    return raw
      .filter((r) => r && r.position && r.url)
      .slice(0, 30)
      .map((r) => ({
        id: `rok-${r.id ?? r.slug}`,
        title: r.position!,
        company: r.company ?? "Unknown",
        location: r.location || "Remote",
        url: r.apply_url || r.url!,
        source: "RemoteOK" as const,
        tags: (r.tags ?? []).slice(0, 5),
        salary: r.salary_min && r.salary_max ? `$${Math.round(r.salary_min / 1000)}k–$${Math.round(r.salary_max / 1000)}k` : undefined,
        postedAt: r.date,
        logo: r.company_logo,
      }));
  } catch {
    return [];
  }
}

async function fetchRemotive(query: string): Promise<LiveJob[]> {
  try {
    const url = query
      ? `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=30`
      : `https://remotive.com/api/remote-jobs?limit=30`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as { jobs: Remotive[] };
    return (data.jobs ?? []).map((j) => ({
      id: `rmv-${j.id}`,
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location || "Remote",
      url: j.url,
      source: "Remotive" as const,
      tags: (j.tags ?? []).slice(0, 5),
      salary: j.salary || undefined,
      postedAt: j.publication_date,
      logo: j.company_logo,
    }));
  } catch {
    return [];
  }
}

export const fetchLiveJobs = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => inputSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const [a, b] = await Promise.all([fetchRemoteOK(data.query), fetchRemotive(data.query)]);
    // Interleave for variety
    const merged: LiveJob[] = [];
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      if (a[i]) merged.push(a[i]);
      if (b[i]) merged.push(b[i]);
    }
    return { jobs: merged.slice(0, data.limit), fetchedAt: new Date().toISOString() };
  });
