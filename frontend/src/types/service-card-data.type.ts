export type ServiceCardData = {
  id: number;
  title: string;
  description: string;
  price?: string;
  priceNote?: string;
  buttonText: string;
  imageUrl?: string;
  isPopular?: boolean;
  features?: string[];
};
