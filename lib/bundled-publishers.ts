/**
 * Curated "as seen on" outlets with bundled transparent logos.
 *
 * Layout (per outlet id):
 *
 *   public/publishers/logos/{id}/color.png
 *   public/publishers/logos/{id}/black.png
 *   public/publishers/logos/{id}/white.png
 *
 * Legacy flat files (`{id}.png`) are still read as black when variants are missing.
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

/** Multi-niche press catalog (Brandfetch-curated + manual Shape / Women's Health). */
export const BUNDLED_PUBLISHERS: BundledPublisher[] = [
  {
    id: "forbes",
    name: "Forbes",
    category: "Business",
    websiteUrl: "https://forbes.com",
    sortOrder: 1,
  },
  {
    id: "bloomberg",
    name: "Bloomberg",
    category: "Business",
    websiteUrl: "https://bloomberg.com",
    sortOrder: 2,
  },
  {
    id: "fortune",
    name: "Fortune",
    category: "Business",
    websiteUrl: "https://fortune.com",
    sortOrder: 3,
  },
  {
    id: "economist",
    name: "The Economist",
    category: "Business",
    websiteUrl: "https://economist.com",
    sortOrder: 4,
  },
  {
    id: "business-insider",
    name: "Business Insider",
    category: "Business",
    websiteUrl: "https://businessinsider.com",
    sortOrder: 5,
  },
  {
    id: "cnbc",
    name: "CNBC",
    category: "Business",
    websiteUrl: "https://cnbc.com",
    sortOrder: 6,
  },
  {
    id: "wall-street-journal",
    name: "The Wall Street Journal",
    category: "Business",
    websiteUrl: "https://wsj.com",
    sortOrder: 7,
  },
  {
    id: "financial-times",
    name: "Financial Times",
    category: "Business",
    websiteUrl: "https://ft.com",
    sortOrder: 8,
  },
  {
    id: "inc",
    name: "Inc.",
    category: "Business",
    websiteUrl: "https://inc.com",
    sortOrder: 9,
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    category: "Business",
    websiteUrl: "https://entrepreneur.com",
    sortOrder: 10,
  },
  {
    id: "fast-company",
    name: "Fast Company",
    category: "Business",
    websiteUrl: "https://fastcompany.com",
    sortOrder: 11,
  },
  {
    id: "harvard-business-review",
    name: "Harvard Business Review",
    category: "Business",
    websiteUrl: "https://hbr.org",
    sortOrder: 12,
  },
  {
    id: "marketwatch",
    name: "MarketWatch",
    category: "Business",
    websiteUrl: "https://marketwatch.com",
    sortOrder: 13,
  },
  {
    id: "barrons",
    name: "Barron's",
    category: "Business",
    websiteUrl: "https://barrons.com",
    sortOrder: 14,
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    category: "Tech",
    websiteUrl: "https://techcrunch.com",
    sortOrder: 20,
  },
  {
    id: "wired",
    name: "Wired",
    category: "Tech",
    websiteUrl: "https://wired.com",
    sortOrder: 21,
  },
  {
    id: "the-verge",
    name: "The Verge",
    category: "Tech",
    websiteUrl: "https://theverge.com",
    sortOrder: 22,
  },
  {
    id: "engadget",
    name: "Engadget",
    category: "Tech",
    websiteUrl: "https://engadget.com",
    sortOrder: 23,
  },
  {
    id: "mashable",
    name: "Mashable",
    category: "Tech",
    websiteUrl: "https://mashable.com",
    sortOrder: 24,
  },
  {
    id: "product-hunt",
    name: "Product Hunt",
    category: "Tech",
    websiteUrl: "https://producthunt.com",
    sortOrder: 25,
  },
  {
    id: "ars-technica",
    name: "Ars Technica",
    category: "Tech",
    websiteUrl: "https://arstechnica.com",
    sortOrder: 26,
  },
  {
    id: "cnet",
    name: "CNET",
    category: "Tech",
    websiteUrl: "https://cnet.com",
    sortOrder: 27,
  },
  {
    id: "zdnet",
    name: "ZDNET",
    category: "Tech",
    websiteUrl: "https://zdnet.com",
    sortOrder: 28,
  },
  {
    id: "gizmodo",
    name: "Gizmodo",
    category: "Tech",
    websiteUrl: "https://gizmodo.com",
    sortOrder: 29,
  },
  {
    id: "new-york-times",
    name: "The New York Times",
    category: "News",
    websiteUrl: "https://nytimes.com",
    sortOrder: 40,
  },
  {
    id: "bbc",
    name: "BBC",
    category: "News",
    websiteUrl: "https://bbc.com",
    sortOrder: 41,
  },
  {
    id: "cnn",
    name: "CNN",
    category: "News",
    websiteUrl: "https://cnn.com",
    sortOrder: 42,
  },
  {
    id: "washington-post",
    name: "The Washington Post",
    category: "News",
    websiteUrl: "https://washingtonpost.com",
    sortOrder: 43,
  },
  {
    id: "the-guardian",
    name: "The Guardian",
    category: "News",
    websiteUrl: "https://theguardian.com",
    sortOrder: 44,
  },
  {
    id: "reuters",
    name: "Reuters",
    category: "News",
    websiteUrl: "https://reuters.com",
    sortOrder: 45,
  },
  {
    id: "associated-press",
    name: "Associated Press",
    category: "News",
    websiteUrl: "https://apnews.com",
    sortOrder: 46,
  },
  {
    id: "usa-today",
    name: "USA Today",
    category: "News",
    websiteUrl: "https://usatoday.com",
    sortOrder: 47,
  },
  {
    id: "time",
    name: "TIME",
    category: "News",
    websiteUrl: "https://time.com",
    sortOrder: 48,
  },
  {
    id: "axios",
    name: "Axios",
    category: "News",
    websiteUrl: "https://axios.com",
    sortOrder: 49,
  },
  {
    id: "npr",
    name: "NPR",
    category: "News",
    websiteUrl: "https://npr.org",
    sortOrder: 50,
  },
  {
    id: "politico",
    name: "Politico",
    category: "News",
    websiteUrl: "https://politico.com",
    sortOrder: 51,
  },
  {
    id: "vogue",
    name: "Vogue",
    category: "Fashion",
    websiteUrl: "https://vogue.com",
    sortOrder: 60,
  },
  {
    id: "gq",
    name: "GQ",
    category: "Fashion",
    websiteUrl: "https://gq.com",
    sortOrder: 61,
  },
  {
    id: "vanity-fair",
    name: "Vanity Fair",
    category: "Fashion",
    websiteUrl: "https://vanityfair.com",
    sortOrder: 62,
  },
  {
    id: "harpers-bazaar",
    name: "Harper's Bazaar",
    category: "Fashion",
    websiteUrl: "https://harpersbazaar.com",
    sortOrder: 63,
  },
  {
    id: "elle",
    name: "Elle",
    category: "Fashion",
    websiteUrl: "https://elle.com",
    sortOrder: 64,
  },
  {
    id: "cosmopolitan",
    name: "Cosmopolitan",
    category: "Fashion",
    websiteUrl: "https://cosmopolitan.com",
    sortOrder: 65,
  },
  {
    id: "instyle",
    name: "InStyle",
    category: "Fashion",
    websiteUrl: "https://instyle.com",
    sortOrder: 66,
  },
  {
    id: "marie-claire",
    name: "Marie Claire",
    category: "Fashion",
    websiteUrl: "https://marieclaire.com",
    sortOrder: 67,
  },
  {
    id: "w-magazine",
    name: "W Magazine",
    category: "Fashion",
    websiteUrl: "https://wmagazine.com",
    sortOrder: 68,
  },
  {
    id: "mens-health",
    name: "Men's Health",
    category: "Fitness",
    websiteUrl: "https://menshealth.com",
    sortOrder: 70,
  },
  {
    id: "womens-health",
    name: "Women's Health",
    category: "Fitness",
    websiteUrl: "https://womenshealth.com",
    sortOrder: 71,
  },
  {
    id: "mens-fitness",
    name: "Men's Fitness",
    category: "Fitness",
    websiteUrl: "https://mensfitness.com",
    sortOrder: 72,
  },
  {
    id: "shape",
    name: "Shape",
    category: "Fitness",
    websiteUrl: "https://shape.com",
    sortOrder: 73,
  },
  {
    id: "self",
    name: "SELF",
    category: "Fitness",
    websiteUrl: "https://self.com",
    sortOrder: 74,
  },
  {
    id: "runners-world",
    name: "Runner's World",
    category: "Fitness",
    websiteUrl: "https://runnersworld.com",
    sortOrder: 75,
  },
  {
    id: "outside",
    name: "Outside",
    category: "Fitness",
    websiteUrl: "https://outsideonline.com",
    sortOrder: 76,
  },
  {
    id: "muscle-and-fitness",
    name: "Muscle & Fitness",
    category: "Fitness",
    websiteUrl: "https://muscleandfitness.com",
    sortOrder: 77,
  },
  {
    id: "health",
    name: "Health",
    category: "Fitness",
    websiteUrl: "https://health.com",
    sortOrder: 78,
  },
  {
    id: "prevention",
    name: "Prevention",
    category: "Fitness",
    websiteUrl: "https://prevention.com",
    sortOrder: 79,
  },
  {
    id: "rolling-stone",
    name: "Rolling Stone",
    category: "Culture",
    websiteUrl: "https://rollingstone.com",
    sortOrder: 80,
  },
  {
    id: "variety",
    name: "Variety",
    category: "Culture",
    websiteUrl: "https://variety.com",
    sortOrder: 81,
  },
  {
    id: "billboard",
    name: "Billboard",
    category: "Culture",
    websiteUrl: "https://billboard.com",
    sortOrder: 82,
  },
  {
    id: "pitchfork",
    name: "Pitchfork",
    category: "Culture",
    websiteUrl: "https://pitchfork.com",
    sortOrder: 83,
  },
  {
    id: "people",
    name: "People",
    category: "Culture",
    websiteUrl: "https://people.com",
    sortOrder: 84,
  },
  {
    id: "hollywood-reporter",
    name: "The Hollywood Reporter",
    category: "Culture",
    websiteUrl: "https://hollywoodreporter.com",
    sortOrder: 85,
  },
  {
    id: "entertainment-weekly",
    name: "Entertainment Weekly",
    category: "Culture",
    websiteUrl: "https://ew.com",
    sortOrder: 86,
  },
  {
    id: "espn",
    name: "ESPN",
    category: "Sports",
    websiteUrl: "https://espn.com",
    sortOrder: 90,
  },
  {
    id: "sports-illustrated",
    name: "Sports Illustrated",
    category: "Sports",
    websiteUrl: "https://si.com",
    sortOrder: 91,
  },
  {
    id: "bon-appetit",
    name: "Bon App\u00e9tit",
    category: "Food",
    websiteUrl: "https://bonappetit.com",
    sortOrder: 100,
  },
  {
    id: "eater",
    name: "Eater",
    category: "Food",
    websiteUrl: "https://eater.com",
    sortOrder: 102,
  },
  {
    id: "byrdie",
    name: "Byrdie",
    category: "Beauty",
    websiteUrl: "https://byrdie.com",
    sortOrder: 111,
  },
  {
    id: "glamour",
    name: "Glamour",
    category: "Beauty",
    websiteUrl: "https://glamour.com",
    sortOrder: 112,
  },
  {
    id: "consumer-reports",
    name: "Consumer Reports",
    category: "Home",
    websiteUrl: "https://consumerreports.org",
    sortOrder: 121,
  },
  {
    id: "real-simple",
    name: "Real Simple",
    category: "Home",
    websiteUrl: "https://realsimple.com",
    sortOrder: 122,
  },
];

const BUNDLED_PUBLISHER_IDS = new Set(
  BUNDLED_PUBLISHERS.map((publisher) => publisher.id)
);

export function isBundledPublisherId(id: string): boolean {
  return BUNDLED_PUBLISHER_IDS.has(id);
}
