import { Hammer, Feather, Palette, Swords, Coins, Telescope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Region {
  name: string;
  short: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  x: number;
  y: number;
}

export const REGIONS: Region[] = [
  {
    name: "The Forge",
    short: "Forge",
    tagline: "Systems that hold under siege",
    description: "Engineering, product, and the patient work of making a thing stand.",
    icon: Hammer,
    accent: "#b0602c",
    x: 27,
    y: 40,
  },
  {
    name: "The Scriptorium",
    short: "Scriptorium",
    tagline: "Words that outlive the season",
    description: "Copy, lore, editing, and the long scroll of search.",
    icon: Feather,
    accent: "#8a6d3b",
    x: 55,
    y: 27,
  },
  {
    name: "The Atelier",
    short: "Atelier",
    tagline: "Marks that survive the carving",
    description: "Design, illustration, film, and the craft of the visible.",
    icon: Palette,
    accent: "#a33b3b",
    x: 71,
    y: 58,
  },
  {
    name: "The War Room",
    short: "War Room",
    tagline: "Horns that reach the right ears",
    description: "Growth, campaigns, and the art of being heard.",
    icon: Swords,
    accent: "#7a1f1f",
    x: 17,
    y: 67,
  },
  {
    name: "The Exchequer",
    short: "Exchequer",
    tagline: "Coin that answers to the ledger",
    description: "Finance, payments, audits, and the keeping of honest books.",
    icon: Coins,
    accent: "#2f6b6b",
    x: 46,
    y: 74,
  },
  {
    name: "The Citadel",
    short: "Citadel",
    tagline: "Counsel drawn from the stars",
    description: "Data, AI, and the systems that turn noise into judgment.",
    icon: Telescope,
    accent: "#6b5b8e",
    x: 82,
    y: 23,
  },
];

export const REGION_NAMES = REGIONS.map((r) => r.name);

export function regionByName(name: string): Region {
  return REGIONS.find((r) => r.name === name) ?? REGIONS[0];
}

export const SORTS = [
  { value: "newest", label: "Newest decrees" },
  { value: "budget_high", label: "Largest purse" },
  { value: "budget_low", label: "Smallest purse" },
  { value: "proposals_low", label: "Fewest suitors" },
  { value: "oldest", label: "Oldest decrees" },
];
