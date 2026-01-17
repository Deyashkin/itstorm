import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

export type OrderFormValue = {
  name: string;
  phone: string;
  service: string;
};

export type ModalStage = 'form' | 'success';

@Component({
  selector: 'app-modal-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-order.html',
  styleUrl: './modal-order.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalOrderComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() open = false;
  @Input() isSubmitting = false;
  @Input() stage: ModalStage = 'form';
  @Input() error: string | null = null;

  private _serviceTitle: string | null = null;

  @Input()
  set serviceTitle(value: string | null) {
    this._serviceTitle = value;
    if (value) {
      this.form.patchValue({ service: value });
    }
  }

  @Input() services: string[] = []; // сюда потом можно передать "все услуги" из main

  get serviceOptions(): string[] {
    const base = (this.services ?? []).slice();

    // гарантируем, что текущая услуга есть в списке (иначе select не сможет выбрать)
    const current = (this.serviceTitle || '').trim();

    // Добавляем текущую услугу, если её нет в списке
    if (current && !base.includes(current)) base.unshift(current);

    // Добавляем пустой вариант для валидации
    return base;
  }

  isTriedSubmit = false;


  get serviceTitle() {
    return this._serviceTitle;
  }

  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<OrderFormValue>();

  form: FormGroup = this.fb.group({
    service: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\+\-\(\)\s]{7,20}$/)]],
  });


  ngOnChanges(changes: SimpleChanges) {
    console.log('Modal changes:', changes);

    // когда открываем модалку — сбрасываем ошибки/состояния
    if (changes['open'] && this.open) {
      console.log('Modal opened, resetting form');
      this.isTriedSubmit = false;

      // Сбрасываем форму с текущей услугой
      const currentService = this.serviceTitle || '';
      this.form.reset({
        service: this.serviceTitle ?? '',
        name: '',
        phone: '',
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();

      // Форсируем валидацию
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.updateValueAndValidity();
        }
      });
    }

    // если изменили serviceTitle (например, кликнули другой слайд)
    if (changes['serviceTitle']) {
      const title = (this.serviceTitle || '').trim();
      if (title && this.form) {
        console.log('Patching service value:', title);
        this.form.patchValue({ service: title }, { emitEvent: false });
      }
    }
  }


  onBackdropClick() {
    this.close.emit();
  }

  submit(): void {
    console.log('Form submission attempt');
    console.log('Form valid:', this.form.valid);
    console.log('Form errors:', this.form.errors);
    console.log('Form value:', this.form.value);

    this.isTriedSubmit = true;

    if (this.form.invalid) {
      console.log('Form is invalid, marking as touched');
      this.form.markAllAsTouched();

      // Показываем ошибки для каждого поля
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`Field ${key} errors:`, control.errors);
        }
      });

      return;
    }

    const v = this.form.getRawValue();
    console.log('Form is valid, emitting:', v);


    this.submitted.emit({
      service: v.service,
      name: v.name,
      phone: v.phone,
    });
  }
}
