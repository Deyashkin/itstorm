import { Component, EventEmitter, Input, Output, inject, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-call-request',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './modal-call-request.html',
  styleUrls: ['./modal-call-request.scss'],
})


export class ModalCallRequest {
  private fb = inject(FormBuilder);

  @Input() open = false;
  @Input() isSubmitting = false;
  @Input() stage: 'form' | 'success' = 'form';

  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<{ name: string; phone: string }>();

  callForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
  });

  onBackdropClick() {
    this.close.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && changes['open'].previousValue === false) {
      this.callForm.reset();
    }
  }

  submit(): void {
    if (this.callForm.invalid) {
      this.callForm.markAllAsTouched();
      return;
    }

    this.submitted.emit({
      name: this.callForm.value.name ?? '',
      phone: this.callForm.value.phone ?? '',
    });
  }
}
