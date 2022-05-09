import * as colors from "https://deno.land/std@0.137.0/fmt/colors.ts";
import { join } from "https://deno.land/std@0.137.0/path/mod.ts";
import { exists } from "https://deno.land/std@0.137.0/fs/mod.ts";

import AbstractFontSource from './sources/AbstractSource.ts'
import kebab from './util/kebab.ts'
import { hiragana } from './util/charset.ts'
import { FontMeta, Font } from './types/FontScrape.ts';
import renderFont from './Renderer.ts';

const outdir = Deno.env.get("DATA_DIR");

class Scraper {
  private sources: AbstractFontSource[];
  
  constructor(sources: AbstractFontSource[]) {
    this.sources = sources;
  }

  public async scrape() {
    console.log(`${colors.blue(colors.bold(`[Scraping sources]`)) }`);
    const starts = [];
    for (const source of this.sources) {
      starts.push(
        new Promise<void>(async (res) => {
          if(source.scrape) {
            try {
              await source.scrape();
            } catch(e) {
              console.error(colors.red(
                `Failed to scrape ${colors.blue(source.name) }`
              ));
              throw e;
            }
          }
          console.log(`Scraped ${colors.blue(source.name) }`);
          res();
        })
      )
      
    }
    await Promise.all(starts);
  }

  public async download() {
    console.log(`${colors.blue(colors.bold(`[Running sources]`)) }`);
    for (const source of this.sources) {
      for await (const fontMetaFamily of source.iter()) {
        if(!fontMetaFamily) continue;

        console.log(colors.green(`[${source.current}/${source.total}]`) + " " + fontMetaFamily.name);

        const families = [];

        for (const fontMeta of fontMetaFamily.items) {
          families.push((async () => {
            const name = this.formatFontName(fontMeta);
            if(!outdir) throw "NO DATA_DIR"

            const fontPath = join(outdir, `font/${name}`);

            let file;
            
            if(await exists(fontPath)) {
              file = (await Deno.readFile(fontPath)).buffer;
              console.log(`\t${name} found`);
            } else {
              file = (await source.getFont(fontMeta)).data;
              
              Deno.writeFile(
                fontPath,
                new Uint8Array(file)
              );

              console.log(`\tDownloaded ${name}`);
            }

            const image = renderFont(file, hiragana);

            Deno.writeFile(
              join(outdir, `images/${kebab(fontMeta.name)}_${fontMeta.weight}.png`),
              image
            );

            console.log(`\t${name} rendered`);
          })())
        }
        
        await Promise.all(families);
      }
    }
  }

  private formatFontName = (font: Font | FontMeta) => {
    return `${kebab(font.name)}_${font.weight}.${font.format}`
  }
}

export default Scraper;