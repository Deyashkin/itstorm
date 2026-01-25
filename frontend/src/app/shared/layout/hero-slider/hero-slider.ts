import {Component, CUSTOM_ELEMENTS_SCHEMA, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

type HeroSlide = {
  subtitle: string;
  titleParts: Array<{
    text: string;
    isHighlighted: boolean;
  }>;
  fullTitle: string;
  description?: string;
  buttonText: string;
  imageUrl: string;
};

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})


export class HeroSliderComponent {
  @Input() slides: HeroSlide[] = [];
  @Input() onOrderClick?: (serviceTitle?: string) => void;
}
