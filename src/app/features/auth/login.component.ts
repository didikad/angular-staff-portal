import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../api/auth.service';

type LoginField = 'username' | 'password';

@Component({
  selector: 'login-component',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submitted = false;
  loading = false;
  errorMessage = '';

  hasFieldError(field: LoginField): boolean {
    const control = this.loginForm.controls[field];
    return control.hasError('required') && (control.touched || this.submitted);
  }

  clearError(): void {
    this.errorMessage = '';
  }

  login(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || this.loading) return;

    const { username, password } = this.loginForm.getRawValue();
    this.loading = true;
    this.authService.login(username, password).subscribe({
      next: (user) => {
        this.loading = false;
        if (!user) {
          this.errorMessage = 'Username atau password tidak sesuai.';
          return;
        }

        void this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Tidak dapat menghubungi API login. Coba lagi.';
      },
    });
  }
}
