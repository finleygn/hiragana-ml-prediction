import AbstractFontSource from "./AbstractSource.ts";
import { FontFamilyMeta, FontMeta, Font } from '../types/FontScrape.ts';

class GoogleFontSource extends AbstractFontSource {
  public name = "Google Fonts";
  public total = 0;

  private dataset: {
    family: string,
    variants: string[],
    subsets: string[],
    files: Record<string, string>,
    category: string,
  }[] = [];
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  public async start(): Promise<void> {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${this.apiKey}`
    );
    if(!response.ok) {
      throw Error("failed to start scraper source");
    }

    const body = await response.json();

    const hiraganaFonts = body.items.filter(
      (font: any) => font.subsets.includes("japanese")
    );

    this.dataset = hiraganaFonts;
    this.total = hiraganaFonts.length;
  }

  protected hasMore(): boolean {
    return this.current !== this.total;
  }


  protected async getMeta(): Promise<FontFamilyMeta> {
    const files = this.dataset[this.current].files;
    const data: FontFamilyMeta = {
      name: this.dataset[this.current].family,
      items: []
    };

    for (const [weight, url] of Object.entries(files)) {
      const urlsplit = url.split('.');
      data.items.push({
        name: this.dataset[this.current].family,
        weight: weight,
        format: urlsplit[urlsplit.length - 1],
        url: url,
      })
    }

    return data;
  }

  public async getFont(font: FontMeta): Promise<Font> {
    const response = await fetch(font.url);
    const urlsplit = font.url.split('.');
    
    if(response.ok) {
      return {
        data: await response.arrayBuffer(),
        name: font.name,
        weight: font.weight,
        format: urlsplit[urlsplit.length - 1]
      }
    } else {
      throw new Error("Couldn't download font: " + font.url);
    }
  }
}

export default GoogleFontSource;