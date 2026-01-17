import { Component, EventEmitter, Input, Output } from '@angular/core';

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

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [],
  templateUrl: './service-card.html',
  styleUrl: './service-card.scss',
})
export class ServiceCardComponent {
  @Input() service!: ServiceCardData;
  @Input() variant: 'default' | 'compact' = 'default';

  @Output() buttonClick = new EventEmitter<ServiceCardData>();




  onButtonClick() {
    this.buttonClick.emit(this.service);
  }
}
