import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  model,
  computed,
  signal,
  effect,
  inject
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
export class ModalOrderComponent {
  private readonly fb = inject(FormBuilder);

  public readonly open = input<boolean>(false);
  public readonly isSubmitting = input<boolean>(false);
  public readonly stage = model<ModalStage>('form');
  public readonly error = input<string | null>(null);
  public readonly services = input<string[]>([]);
  public readonly serviceTitle = input<string | null>(null);

  public readonly close = output<void>();
  public readonly submitted = output<OrderFormValue>();

  private readonly internalIsTriedSubmit = signal<boolean>(false);
  public readonly isTriedSubmit = this.internalIsTriedSubmit.asReadonly();

  public readonly serviceOptions = computed<string[]>(() => {
    const base = this.services().slice();
    const current = (this.serviceTitle() || '').trim();

    if (current && !base.includes(current)) {
      base.unshift(current);
    }

    return base;
  });

  public readonly isFormInvalid = computed<boolean>(() => {
    return this.form.invalid && this.internalIsTriedSubmit();
  });

  public readonly form: FormGroup = this.fb.group({
    service: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\+\-\(\)\s]{7,20}$/)]],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.internalIsTriedSubmit.set(false);

        this.form.reset({
          service: this.serviceTitle() ?? '',
          name: '',
          phone: '',
        });

        this.form.markAsPristine();
        this.form.markAsUntouched();
      }
    });

    effect(() => {
      const title = this.serviceTitle();
      if (title && this.form) {
        this.form.patchValue({ service: title }, { emitEvent: false });
      }
    });
  }

  public onBackdropClick(): void {
    this.close.emit();
  }

  public submit(): void {
    this.internalIsTriedSubmit.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    this.submitted.emit({
      service: formValue.service,
      name: formValue.name,
      phone: formValue.phone,
    });
  }

  public getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);

    if (!control || !control.errors || !this.internalIsTriedSubmit()) {
      return null;
    }

    if (control.errors['required']) {
      return fieldName === 'name' ? 'Имя обязательно' : 'Телефон обязателен';
    }

    if (control.errors['minlength']) {
      return 'Минимум 2 символа';
    }

    if (control.errors['maxlength']) {
      return 'Максимум 30 символов';
    }

    if (control.errors['pattern']) {
      return 'Введите корректный номер телефона';
    }

    return null;
  }

  public isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.invalid && this.internalIsTriedSubmit());
  }
}
