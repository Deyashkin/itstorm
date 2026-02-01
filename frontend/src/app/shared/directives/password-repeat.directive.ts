import { Directive } from '@angular/core';
import {
  AbstractControl,
  type ValidationErrors,
  type Validator,
  NG_VALIDATORS
} from '@angular/forms';

@Directive({
  selector: '[appPasswordRepeat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordRepeatDirective,
      multi: true
    }
  ]
})
export class PasswordRepeatDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordRepeat = control.get('passwordRepeat');

    if (password && passwordRepeat && password.value !== passwordRepeat.value) {
      passwordRepeat?.setErrors({ ...passwordRepeat.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (passwordRepeat?.hasError('passwordMismatch')) {
      const errors = { ...passwordRepeat.errors };
      delete errors['passwordMismatch'];
      passwordRepeat.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }

    return null;
  }
}
