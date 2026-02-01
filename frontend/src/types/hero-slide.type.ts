export type HeroSlideType = {
  subtitle: string;
  titleParts: Array<{
    text: string;
    isHighlighted: boolean;
  }>;
  fullTitle: string;
  description?: string;
  buttonText: string;
  imageUrl: string;
  serviceTitle?: string;
};
