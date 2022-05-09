import { Font, FontFamilyMeta, FontMeta } from '../types/FontScrape.ts';

abstract class AbstractFontSource {
  public abstract name: string;
  public abstract total?: number; // scraper might not know total
  public current: number = 0;

  protected abstract hasMore(): boolean;

  /**
   * Get details of font to prescrape - used to check if
   * font has already been scraped
   */
  protected abstract getMeta(): Promise<FontFamilyMeta>;

  /**
   * Get font based on current instance state
   */
  public abstract getFont(family: FontMeta): Promise<Font>;

  /**
   * The loading step - get possible fonts to download
   */
  public abstract scrape?(): Promise<void>;

  public iter = () => ({
    [Symbol.asyncIterator]: () => {
      return {
        next: async () => {
          const done = !this.hasMore();

          if(done) {
            return {
              done: true
            }
          }
          
          const value = await this.getMeta();
          this.current++;

          return {
            value,
            done
          }
        }
      }
    }
  });
}

export default AbstractFontSource;
