import { Component, CUSTOM_ELEMENTS_SCHEMA, input, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type {ReviewType} from '../../../../types/review.type';

@Component({
  selector: 'app-reviews-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-slider.html',
  styleUrl: './reviews-slider.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class ReviewsSliderComponent {
  public readonly reviews = input<ReviewType[]>([], { alias: 'reviews' });
  public readonly title = input<string>('Отзывы о нашей работе', { alias: 'title' });
}
