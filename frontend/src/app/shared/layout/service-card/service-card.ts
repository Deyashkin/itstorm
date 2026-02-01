import {
  Component,
  input,
  output,
} from '@angular/core';
import type {ServiceCardData} from '../../../../types/service-card-data.type';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [],
  templateUrl: './service-card.html',
  styleUrl: './service-card.scss',
})


export class ServiceCardComponent {

  public readonly service = input.required<ServiceCardData>();
  public readonly variant = input<'default' | 'compact'>('default');
  public readonly buttonClick = output<ServiceCardData>();

  public onButtonClick() {
    this.buttonClick.emit(this.service());
  }
}
