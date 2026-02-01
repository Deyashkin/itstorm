import {
  Component,
  ChangeDetectionStrategy, signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {
  ModalCallRequestComponent,
  type ModalStage
} from '../../ui/modal/modal-call-request/modal-call-request';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    ModalCallRequestComponent
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})

export class Footer {

  public readonly isCallModalOpen = signal(false);
  public readonly callModalStage = signal<ModalStage>('form');
  public readonly isCallSubmitting = signal(false);

  openCallModal(): void {
    this.isCallModalOpen.set(true);
    this.callModalStage.set('form');
  }

  closeCallModal(): void {
    this.isCallModalOpen.set(false);
    this.callModalStage.set('form');
    this.isCallSubmitting.set(false);
  }

  submitCallRequest(data: { name: string; phone: string }): void {
    this.isCallSubmitting.set(true);

    of(true).pipe(delay(400)).subscribe({
      next: () => {
        this.isCallSubmitting.set(false);
        this.callModalStage.set('success');
        console.log('CALL REQUEST:', data);
      },
      error: () => {
        this.isCallSubmitting.set(false);
      }
    });
  }
}

