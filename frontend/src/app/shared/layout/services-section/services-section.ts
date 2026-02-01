import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from '../service-card/service-card';
import { ServiceCardData } from '../../../../types/service-card-data.type';

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent],
  templateUrl: './services-section.html',
  styleUrls: ['./services-section.scss']
})


export class ServicesSectionComponent {

  public readonly services = input<ServiceCardData[]>([], { alias: 'services' });
  public readonly title = input<string>('Услуги, которые мы предлагаем', { alias: 'title' });
  public readonly columns = input<2 | 3 | 4>(3, { alias: 'columns' });
  public readonly serviceSelected = output<ServiceCardData>();

  public readonly gridClass = computed(() => {
    return `services-grid services-grid--${this.columns()}`;
  });

  public onServiceButtonClick(service: ServiceCardData) {
    this.serviceSelected.emit(service);
  }
}
