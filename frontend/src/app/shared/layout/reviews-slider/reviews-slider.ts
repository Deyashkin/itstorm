import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type Review = {
  name: string;
  text: string;
  avatarUrl: string;
};

@Component({
  selector: 'app-reviews-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-slider.html',
  styleUrl: './reviews-slider.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class ReviewsSliderComponent {
  @Input() reviews: Review[] = [];
  @Input() title: string = 'Отзывы о нашей работе';
}
