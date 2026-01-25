import { ChangeDetectionStrategy,  Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
  private _serviceTitle: string | null = null;

  @Input() open = false;
  @Input() isSubmitting = false;
  @Input() stage: ModalStage = 'form';
  @Input() error: string | null = null;

  @Input()
  set serviceTitle(value: string | null) {
    this._serviceTitle = value;
    if (value) {
      this.form.patchValue({ service: value });
    }
  }

  @Input() services: string[] = [];

  get serviceOptions(): string[] {
    const base = (this.services ?? []).slice();
    const current = (this.serviceTitle || '').trim();

    if (current && !base.includes(current)) base.unshift(current);

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

    if (changes['open'] && this.open) {
      this.isTriedSubmit = false;

      const currentService = this.serviceTitle || '';
      this.form.reset({
        service: this.serviceTitle ?? '',
        name: '',
        phone: '',
      });

      this.form.markAsPristine();
      this.form.markAsUntouched();

      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control) {
          control.updateValueAndValidity();
        }
      });
    }

    if (changes['serviceTitle']) {
      const title = (this.serviceTitle || '').trim();
      if (title && this.form) {
        this.form.patchValue({ service: title }, { emitEvent: false });
      }
    }
  }

  onBackdropClick() {
    this.close.emit();
  }

  submit(): void {
    this.isTriedSubmit = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`Field ${key} errors:`, control.errors);
        }
      });
      return;
    }

    const v = this.form.getRawValue();

    this.submitted.emit({
      service: v.service,
      name: v.name,
      phone: v.phone,
    });
  }
}
