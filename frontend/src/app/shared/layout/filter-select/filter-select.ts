import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-select.html',
  styleUrl: './filter-select.scss',
})
export class FilterSelectComponent {
  @Input() selectedSort: string = 'newest';
  @Output() sortChange = new EventEmitter<string>();

  sortOptions = [
    { value: 'newest', label: 'Сначала новые' },
    { value: 'oldest', label: 'Сначала старые' },
    { value: 'popular', label: 'По популярности' }
  ];

  onSortChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    this.sortChange.emit(value);
  }
}
