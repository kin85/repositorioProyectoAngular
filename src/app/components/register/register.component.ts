import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{

  email: string = '';
  password: string = '';
  error: string|undefined;
  logged: boolean = false;
  registerForm: FormGroup;

  constructor(private supaService: SupabaseService, private formBuilder: FormBuilder){
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern('.*@.*')]],
      passwords: this.formBuilder.group({
       password: ['',[Validators.required, Validators.pattern('.*[0-9].*'), this.passwordValidator(8)]],
       password2: ['',[Validators.required, Validators.pattern('.*[0-9].*'), this.passwordValidator(8)]],
     }, {
       validators:
       this.passwordCrossValidator
     })
   }); 
   }
 
   get password1NotValid(){
     if (this.registerForm.get('passwords.password')?.untouched) {
       return ''
     } else if(this.registerForm.get('passwords.password')?.touched && this.registerForm.get('passwords.password')?.valid){
       return 'is-valid'
     } else {
       return 'is-invalid'
     }
   }
 
   get password2NotValid(){
     if (this.registerForm.get('passwords.password2')?.untouched) {
       return ''
     } else if(this.registerForm.get('passwords.password2')?.touched && this.registerForm.get('passwords.password2')?.valid && this.registerForm.get('passwords')?.valid){
       return 'is-valid'
     } else {
       return 'is-invalid'
     }
   }
 
 
   get crossPasswordsNotValid(){
     if(this.registerForm.get('passwords')?.invalid){
       return true
     }else {
       return false
     }
   }
 
   get emailClass(){
     if (this.registerForm.get('email')?.untouched) {
       return ''
     } else if(this.registerForm.get('email')?.touched && this.registerForm.get('email')?.valid){
       return 'is-valid'
     } else {
       return 'is-invalid'
     }
   }
 
   get emailNotValid(){
     if (this.registerForm.get('email')?.invalid && this.registerForm.get('email')?.touched) {
       return true;
     } else {
       return false;
     }
   }
 
   passwordValidator(minlength: number): ValidatorFn {
     return (c: AbstractControl): ValidationErrors | null => {
       if (c.value) {
         let valid = c.value.length >= minlength && c.value.includes('5')
         return valid ? null : {password: 'no valida'}
         }
         return null; };
    }
 
    passwordCrossValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
     const ps = control.get('password');
     const ps2 = control.get('password2');
     console.log(ps?.value,ps2?.value);
     
     return ps && ps2 && ps.value === ps2.value ? null : { passwordCrossValidator: true };
   };
   


  sendRegister(){
    if (this.registerForm.invalid) {
      console.log('Formulario inválido');
      console.log(this.registerForm.get('email')?.value);
      return; // Detener la ejecución si el formulario es inválido
    }
  
    const {email ,passwords:{password}} = this.registerForm.value;
    this.supaService.register(email,password).subscribe(
      {next: registerData => console.log(registerData),
        complete: ()=> console.log("complete"),
        error: error => {this.error = error.message; console.log(error);
        } 
      }
    )
  }

  ngOnInit(): void {
    this.logged =  this.supaService.loggedSubject.getValue();
    this.supaService.loggedSubject.subscribe(logged => this.logged = logged);
    this.supaService.isLogged();
  }
}
