import { Directive } from '@angular/core';
import {
  AbstractControl,
  type ValidationErrors,
  type Validator
} from '@angular/forms';

@Directive({
  selector: '[PasswordRepeat]',
  standalone: true,
})
export class PasswordRepeatDirective implements Validator {


  validate(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordRepeat = control.get('passwordRepeat');

    if (password?.value !== passwordRepeat?.value) {
        passwordRepeat?.setErrors({passwordRepeat: true});
        return passwordRepeat;
    }
    return  null;
  }
}
