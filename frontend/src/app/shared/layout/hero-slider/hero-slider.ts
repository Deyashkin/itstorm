import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  output
} from '@angular/core';
import {CommonModule} from '@angular/common';
import type { HeroSlideType } from '../../../../types/hero-slide.type';


@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HeroSliderComponent {
  public readonly slides = input<HeroSlideType[]>([]);
  public readonly orderClick = output<string | undefined>();
}
