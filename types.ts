export enum Genre {
  Nature = 'Nature',
  Urban = 'Urban Architecture',
  Abstract = 'Abstract Art',
  Space = 'Deep Space',
  Minimalism = 'Minimalism',
  Animals = 'Wildlife'
}

export enum FrameStyle {
  None = 'None',
  ModernBlack = 'Modern Black',
  GalleryWhite = 'Gallery White',
  Wood = 'Classic Wood'
}

export enum FilterPreset {
  Original = 'Original',
  Noir = 'Noir',
  Vivid = 'Vivid',
  Warm = 'Warm',
  Cool = 'Cool',
  Cinematic = 'Cinematic',
  Fade = 'Fade'
}

export interface AppConfig {
  genre: Genre;
  interval: number; // seconds
  isSlideshow: boolean;
  frameStyle: FrameStyle;
  filterPreset: FilterPreset;
  frameWidth: number; // px - border width for frames
}

export interface ArtImage {
  url: string;
  id: string;
  source: 'gemini' | 'stock';
}