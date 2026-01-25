import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalCallRequest } from '../../ui/modal/modal-call-request/modal-call-request';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalCallRequest,
    RouterLink
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})

export class Footer {

  private cdr = inject(ChangeDetectorRef);

  isCallModalOpen = false;
  isSubmitting = false;
  callModalStage: 'form' | 'success' = 'form';

  openCallModal(): void {
    this.callModalStage = 'form';
    this.isCallModalOpen = true;
  }

  closeCallModal(): void {
    this.isCallModalOpen = false;
    this.callModalStage = 'form';
    this.isSubmitting = false;
  }

  submitCallForm(data: { name: string; phone: string }): void {
    this.isSubmitting = true;
    this.cdr.detectChanges();

    of(true).pipe(delay(400)).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.callModalStage = 'success';
        this.cdr.detectChanges();
        console.log('CALL REQUEST:', data);
      },
      error: () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}

