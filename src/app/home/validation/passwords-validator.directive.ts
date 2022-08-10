import { Directive, ElementRef, Input } from "@angular/core";
import { AbstractControl, NgForm, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from "@angular/forms";

@Directive({
    selector: '[passwordsValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: PasswordsValidatorDirective, multi: true}]
  })
export class PasswordsValidatorDirective implements Validator {

  constructor() {}

  validate(control: AbstractControl): ValidationErrors {
    const password = control.get("password")?.value;
    const password_confirm = control.get("password_confirm")?.value;
    return this.passwordsValidator(password, password_confirm)(control);
  }

  registerOnValidatorChange?(fn: () => void): void {}

  passwordsValidator(password: string, password_confirm: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const matching_error = password !== password_confirm;
      return matching_error ? {matchingError: true} : null;
    };
  }

}