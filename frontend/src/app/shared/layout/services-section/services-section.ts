import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type ServiceCardData, ServiceCardComponent } from '../service-card/service-card';

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent],
  templateUrl: './services-section.html',
  styleUrls: ['./services-section.scss']
})


export class ServicesSectionComponent {
  @Input() services: ServiceCardData[] = [];
  @Input() title = 'Услуги, которые мы предлагаем';
  @Input() columns: 2 | 3 | 4 = 3;

  @Output() serviceSelected = new EventEmitter<ServiceCardData>();

  get gridClass(): string {
    return `services-grid services-grid--${this.columns}`;
  }

  onServiceButtonClick(service: ServiceCardData) {
    this.serviceSelected.emit(service);
  }
}
