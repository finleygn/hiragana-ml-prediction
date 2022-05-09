export type Font = {
  data: ArrayBuffer;
  weight: string;
  name: string;
  format: string;
}

export type FontMeta = {
  weight: string;
  name: string;
  format: string;
  url: string;
}

export type FontFamily = {
  name: string;
  items: Font[];
};

export type FontFamilyMeta = {
  name: string;
  items: FontMeta[];
};