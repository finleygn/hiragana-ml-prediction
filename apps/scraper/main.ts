import * as colors from "https://deno.land/std@0.137.0/fmt/colors.ts";

import GoogleFontSource from "./sources/GoogleFontSource.ts";
import Scraper from "./Scraper.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

if(!GOOGLE_API_KEY) {
  throw Error("missing google api key")
}

const scraper = new Scraper([
  new GoogleFontSource(GOOGLE_API_KEY),
])

await scraper.startSources();
await scraper.runSources();
