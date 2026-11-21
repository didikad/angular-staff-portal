import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../api/auth.service';
import { AuthUser } from '../../models/auth.model';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<LoginComponent>>;
  let router: Router;
  const authService = {
    login: vi.fn((_username: string, _password: string) => of<AuthUser | null>(null)),
  };

  beforeEach(async () => {
    authService.login.mockReturnValue(of(null));
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('renders labeled username and password fields', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Login Your Account');
    expect(element.querySelector('label[for="username"]')).toBeTruthy();
    expect(element.querySelector('input#username')?.getAttribute('type')).toBe('text');
    expect(element.querySelector('label[for="password"]')).toBeTruthy();
    expect(element.querySelector('input#password')?.getAttribute('type')).toBe('password');
    expect(element.textContent).toContain('admin123');
  });

  it('shows clear required-field messages when submitted empty', () => {
    fixture.componentInstance.login();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#username-error')?.textContent).toContain('Username wajib diisi');
    expect(element.querySelector('#password-error')?.textContent).toContain('Password wajib diisi');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('shows an error when the auth service rejects the credentials', () => {
    fixture.componentInstance.loginForm.setValue({ username: 'admin', password: 'wrong' });
    authService.login.mockReturnValue(of(null));

    fixture.componentInstance.login();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Username atau password tidak sesuai');
  });

  it('navigates to the dashboard after a successful login', () => {
    fixture.componentInstance.loginForm.setValue({ username: 'admin', password: 'admin123' });
    authService.login.mockReturnValue(of({ username: 'admin', displayName: 'Admin' }));

    fixture.componentInstance.login();

    expect(authService.login).toHaveBeenCalledWith('admin', 'admin123');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('shows an API error when the login endpoint cannot be reached', () => {
    fixture.componentInstance.loginForm.setValue({ username: 'admin', password: 'admin123' });
    authService.login.mockReturnValue(throwError(() => new Error('Network error')));

    fixture.componentInstance.login();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Tidak dapat menghubungi API login');
  });
});
