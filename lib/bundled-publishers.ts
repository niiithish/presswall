/**
 * Curated "as seen on" outlets with bundled transparent logos.
 *
 * Drop files into `public/publishers/logos/` using the publisher `id` as the
 * filename. Use PNG with a transparent background:
 *
 *   public/publishers/logos/forbes.png
 *   public/publishers/logos/techcrunch.svg
 *
 * Supported extensions (first match wins): .png, .svg, .webp
 */

export const BUNDLED_PUBLISHER_LOGO_DIR = "/publishers/logos";

export const BUNDLED_LOGO_EXTENSIONS = [".png", ".svg", ".webp"] as const;

export interface BundledPublisher {
  category: string;
  id: string;
  name: string;
  sortOrder: number;
  websiteUrl: string;
}

/** Top 20 press / business outlets for startup "as seen on" walls. */
export const BUNDLED_PUBLISHERS: BundledPublisher[] = [
  {
    id: "forbes",
    name: "Forbes",
    category: "Business",
    websiteUrl: "https://forbes.com",
    sortOrder: 1,
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    category: "Business",
    websiteUrl: "https://entrepreneur.com",
    sortOrder: 2,
  },
  {
    id: "inc",
    name: "Inc.",
    category: "Business",
    websiteUrl: "https://inc.com",
    sortOrder: 3,
  },
  {
    id: "fast-company",
    name: "Fast Company",
    category: "Business",
    websiteUrl: "https://fastcompany.com",
    sortOrder: 4,
  },
  {
    id: "bloomberg",
    name: "Bloomberg",
    category: "Business",
    websiteUrl: "https://bloomberg.com",
    sortOrder: 5,
  },
  {
    id: "business-insider",
    name: "Business Insider",
    category: "Business",
    websiteUrl: "https://businessinsider.com",
    sortOrder: 6,
  },
  {
    id: "cnbc",
    name: "CNBC",
    category: "Business",
    websiteUrl: "https://cnbc.com",
    sortOrder: 7,
  },
  {
    id: "fortune",
    name: "Fortune",
    category: "Business",
    websiteUrl: "https://fortune.com",
    sortOrder: 8,
  },
  {
    id: "harvard-business-review",
    name: "Harvard Business Review",
    category: "Business",
    websiteUrl: "https://hbr.org",
    sortOrder: 9,
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    category: "Tech",
    websiteUrl: "https://techcrunch.com",
    sortOrder: 10,
  },
  {
    id: "wired",
    name: "Wired",
    category: "Tech",
    websiteUrl: "https://wired.com",
    sortOrder: 11,
  },
  {
    id: "the-verge",
    name: "The Verge",
    category: "Tech",
    websiteUrl: "https://theverge.com",
    sortOrder: 12,
  },
  {
    id: "mashable",
    name: "Mashable",
    category: "Tech",
    websiteUrl: "https://mashable.com",
    sortOrder: 13,
  },
  {
    id: "new-york-times",
    name: "The New York Times",
    category: "News",
    websiteUrl: "https://nytimes.com",
    sortOrder: 14,
  },
  {
    id: "wall-street-journal",
    name: "The Wall Street Journal",
    category: "News",
    websiteUrl: "https://wsj.com",
    sortOrder: 15,
  },
  {
    id: "washington-post",
    name: "The Washington Post",
    category: "News",
    websiteUrl: "https://washingtonpost.com",
    sortOrder: 16,
  },
  {
    id: "bbc",
    name: "BBC",
    category: "News",
    websiteUrl: "https://bbc.com",
    sortOrder: 17,
  },
  {
    id: "cnn",
    name: "CNN",
    category: "News",
    websiteUrl: "https://cnn.com",
    sortOrder: 18,
  },
  {
    id: "the-guardian",
    name: "The Guardian",
    category: "News",
    websiteUrl: "https://theguardian.com",
    sortOrder: 19,
  },
  {
    id: "usa-today",
    name: "USA Today",
    category: "News",
    websiteUrl: "https://usatoday.com",
    sortOrder: 20,
  },
];

const BUNDLED_PUBLISHER_IDS = new Set(
  BUNDLED_PUBLISHERS.map((publisher) => publisher.id)
);

export function isBundledPublisherId(id: string): boolean {
  return BUNDLED_PUBLISHER_IDS.has(id);
}
