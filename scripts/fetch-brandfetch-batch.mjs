/**
 * One-shot Brandfetch logo fetch → color/black/white variants.
 * Skips ids that already have public/publishers/logos/{id}/color.png
 * and "shape" (manual). Rate-limit friendly.
 *
 * Usage: bun scripts/fetch-brandfetch-batch.mjs
 * Env: BRANDFETCH_API_KEY (from .env.local)
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const rawDir = "/tmp/bf-batch2";
const mastersDir = "/tmp/bf-masters2";
mkdirSync(rawDir, { recursive: true });
mkdirSync(mastersDir, { recursive: true });

function loadEnvLocal() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvLocal();

const KEY = process.env.BRANDFETCH_API_KEY;
if (!KEY) {
  console.error("Missing BRANDFETCH_API_KEY");
  process.exit(1);
}

const CATALOG = [
  ["ars-technica", "arstechnica.com"],
  ["cnet", "cnet.com"],
  ["zdnet", "zdnet.com"],
  ["gizmodo", "gizmodo.com"],
  ["washington-post", "washingtonpost.com"],
  ["the-guardian", "theguardian.com"],
  ["reuters", "reuters.com"],
  ["associated-press", "apnews.com"],
  ["usa-today", "usatoday.com"],
  ["time", "time.com"],
  ["axios", "axios.com"],
  ["npr", "npr.org"],
  ["politico", "politico.com"],
  ["gq", "gq.com"],
  ["vanity-fair", "vanityfair.com"],
  ["harpers-bazaar", "harpersbazaar.com"],
  ["elle", "elle.com"],
  ["cosmopolitan", "cosmopolitan.com"],
  ["instyle", "instyle.com"],
  ["marie-claire", "marieclaire.com"],
  ["w-magazine", "wmagazine.com"],
  ["mens-health", "menshealth.com"],
  ["mens-fitness", "mensfitness.com"],
  ["self", "self.com"],
  ["runners-world", "runnersworld.com"],
  ["outside", "outsideonline.com"],
  ["muscle-and-fitness", "muscleandfitness.com"],
  ["health", "health.com"],
  ["prevention", "prevention.com"],
  ["rolling-stone", "rollingstone.com"],
  ["variety", "variety.com"],
  ["billboard", "billboard.com"],
  ["pitchfork", "pitchfork.com"],
  ["people", "people.com"],
  ["hollywood-reporter", "hollywoodreporter.com"],
  ["entertainment-weekly", "ew.com"],
  ["espn", "espn.com"],
  ["sports-illustrated", "si.com"],
  ["bon-appetit", "bonappetit.com"],
  ["food-and-wine", "foodandwine.com"],
  ["eater", "eater.com"],
  ["allure", "allure.com"],
  ["byrdie", "byrdie.com"],
  ["glamour", "glamour.com"],
  ["architectural-digest", "architecturaldigest.com"],
  ["consumer-reports", "consumerreports.org"],
  ["real-simple", "realsimple.com"],
];

const DELAY_MS = 4000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBrand(domain, tries = 6) {
  for (let t = 1; t <= tries; t++) {
    const res = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    if (res.status === 429) {
      const wait = DELAY_MS * (t + 1) * 2;
      console.log(`  429 wait ${Math.round(wait / 1000)}s (try ${t})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  }
  throw new Error("rate limited");
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "PresswallLogoCurator/1.0",
      Referer: "https://presswall.noxify.io/",
    },
  });
  if (!res.ok) throw new Error(`dl ${res.status}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(r.stderr || r.stdout || `${cmd} failed`);
  }
  return r.stdout;
}

function inkStats(path) {
  try {
    const out = run("magick", [
      path,
      "(",
      "+clone",
      "-alpha",
      "extract",
      "-threshold",
      "15%",
      ")",
      "-compose",
      "CopyOpacity",
      "-composite",
      "-scale",
      "1x1!",
      "-format",
      "%[fx:u.p{0,0}.r],%[fx:u.p{0,0}.g],%[fx:u.p{0,0}.b],%[fx:u.p{0,0}.a]",
      "info:",
    ]).trim();
    return out.split(",").map(Number);
  } catch {
    return null;
  }
}

function toPngMaster(src, dest) {
  const ext = src.toLowerCase().slice(src.lastIndexOf("."));
  if (ext === ".jpg" || ext === ".jpeg") {
    run("magick", [
      src,
      "-alpha",
      "off",
      "-fuzz",
      "12%",
      "-transparent",
      "white",
      "-fuzz",
      "8%",
      "-transparent",
      "black",
      "-trim",
      "+repage",
      dest,
    ]);
  } else if (ext === ".svg") {
    const r = spawnSync("rsvg-convert", ["-w", "1200", src, "-o", dest]);
    if (r.status !== 0) {
      run("magick", [
        "-background",
        "none",
        "-density",
        "400",
        src,
        "-trim",
        "+repage",
        dest,
      ]);
    }
  } else {
    run("magick", [src, "-alpha", "on", "-trim", "+repage", dest]);
    try {
      const amean = Number(
        run("magick", [
          dest,
          "-alpha",
          "extract",
          "-format",
          "%[fx:mean]",
          "info:",
        ]).trim()
      );
      if (amean > 0.98) {
        run("magick", [
          dest,
          "-alpha",
          "off",
          "-fuzz",
          "10%",
          "-transparent",
          "white",
          "-trim",
          "+repage",
          dest,
        ]);
      }
    } catch {
      /* ignore */
    }
  }
}

const results = [];
const script = join(ROOT, "scripts/process-publisher-logo-variants.sh");

for (const [pid, domain] of CATALOG) {
  const colorPath = join(ROOT, "public/publishers/logos", pid, "color.png");
  if (existsSync(colorPath)) {
    console.log(`SKIP has ${pid}`);
    results.push({ id: pid, status: "exists" });
    continue;
  }

  console.log(`\n=== ${pid} (${domain})`);
  try {
    const brand = await fetchBrand(domain);
    const logos = brand.logos || [];
    const logoType = logos.filter((L) => L.type === "logo");
    const iconType = logos.filter((L) => L.type === "icon");
    const pool = logoType.length ? logoType : iconType;
    const kind = logoType.length ? "logo" : iconType.length ? "icon" : "none";
    if (!pool.length) {
      console.log("  no assets");
      results.push({ id: pid, status: "no-assets" });
      await sleep(DELAY_MS);
      continue;
    }

    const downloaded = [];
    for (const L of pool) {
      const theme = L.theme || "unknown";
      const fmts = L.formats || [];
      const pngs = fmts.filter((f) => (f.format || "").toLowerCase() === "png");
      const others = fmts.filter((f) =>
        ["webp", "svg", "jpeg", "jpg"].includes((f.format || "").toLowerCase())
      );
      const ordered = pngs.length ? pngs : others;
      if (!ordered.length) continue;
      const f = ordered.reduce((a, b) =>
        (a.width || 0) * (a.height || 0) >= (b.width || 0) * (b.height || 0)
          ? a
          : b
      );
      let ext = (f.format || "png").toLowerCase().replace("jpeg", "jpg");
      const dest = join(rawDir, `${pid}__${kind}__${theme}.${ext}`);
      try {
        await download(f.src, dest);
        downloaded.push([theme, dest]);
        console.log(`  got ${kind}/${theme}`);
      } catch (e) {
        console.log(`  dl fail ${theme}: ${e.message}`);
      }
    }

    if (!downloaded.length) {
      results.push({ id: pid, status: "download-fail" });
      await sleep(DELAY_MS);
      continue;
    }

    let best = null;
    let bestScore = null;
    for (const [theme, path] of downloaded) {
      const master = join(mastersDir, `${pid}__${theme}.png`);
      try {
        toPngMaster(path, master);
      } catch (e) {
        console.log(`  norm fail ${theme}: ${e.message}`);
        continue;
      }
      const stats = inkStats(master);
      if (!stats) continue;
      const [r, g, b, a] = stats;
      if (a < 0.02) continue;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      const score =
        sat * 2 +
        (lum < 0.5 ? 0.3 : 0) +
        (existsSync(master) ? statSync(master).size / 1e6 : 0);
      if (bestScore === null || score > bestScore) {
        bestScore = score;
        best = [theme, master];
      }
    }

    if (!best) {
      results.push({ id: pid, status: "no-usable" });
      await sleep(DELAY_MS);
      continue;
    }

    const [theme, master] = best;
    const final = join(mastersDir, `${pid}.png`);
    writeFileSync(final, readFileSync(master));
    const pr = spawnSync(script, [final, pid], {
      cwd: ROOT,
      encoding: "utf8",
    });
    if (pr.status !== 0) {
      console.log(`  process fail: ${pr.stderr || pr.stdout}`);
      results.push({ id: pid, status: "process-fail" });
    } else {
      console.log(`  OK master=${theme} kind=${kind}`);
      console.log(pr.stdout.trim());
      results.push({ id: pid, status: "ok", theme, kind });
    }
  } catch (e) {
    console.log(`  FAIL ${e.message}`);
    results.push({ id: pid, status: "fail", error: String(e.message) });
  }

  await sleep(DELAY_MS);
}

writeFileSync("/tmp/bf-results3.json", JSON.stringify(results, null, 2));
const counts = {};
for (const r of results) {
  counts[r.status] = (counts[r.status] || 0) + 1;
}
console.log("\n=== DONE ===");
console.log(counts);
console.log(
  "ok:",
  results.filter((r) => r.status === "ok").map((r) => r.id)
);
console.log(
  "fail:",
  results.filter((r) => !["ok", "exists"].includes(r.status))
);
