import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

import AbstractFontSource from "./AbstractSource.ts";
import { FontFamilyMeta, FontMeta, Font } from '../types/FontScrape.ts';

class JapaneseFontsOrgSource extends AbstractFontSource {
  public name = "Google Fonts";
  public total = 0;

  private dataset: unknown[] = [];

  private loadPaginationPage = async (page: number): Promise<{ 
    hasNext: boolean,
    familyPages: string[]
  }> => {
    const res = await fetch(
      page === 1 ? "https://japanesefonts.org/category/view-all" : "https://japanesefonts.org/category/view-all/page/" + page
    );
    const html = await res.text();
    const document: any = new DOMParser().parseFromString(html, 'text/html');

    const familyPages = [];

    const boxes = document.querySelectorAll(".list-boxed-post-2");
    
    for (const box of boxes) {
      familyPages.push(box.querySelector('a').href);
    }

    return {
      hasNext: !!document.querySelector(".next.page-numbers"),
      familyPages,
    }
  }

  public async scrape(): Promise<void> {
    // Scrape a bunch of shit here

    console.log(await this.loadPaginationPage(2));

    // this.dataset = hiraganaFonts;
    // this.total = hiraganaFonts.length;
  }

  protected hasMore(): boolean {
    return this.current !== this.total;
  }


  protected async getMeta(): Promise<FontFamilyMeta> {
  }

  public async getFont(font: FontMeta): Promise<Font> {
  }
}

export default JapaneseFontsOrgSource;