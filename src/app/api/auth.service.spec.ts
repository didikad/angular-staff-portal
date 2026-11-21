import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('returns the matching user from the auth JSON API', () => {
    let result: unknown;
    service.login(' ADMIN ', 'admin123').subscribe((user) => result = user);

    const request = httpTestingController.expectOne('/api/auth.json');
    expect(request.request.method).toBe('GET');
    request.flush({ accounts: [{ username: 'admin', password: 'admin123', displayName: 'Admin' }] });

    expect(result).toEqual({ username: 'admin', displayName: 'Admin' });
  });

  it('returns null when the username or password does not match', () => {
    let result: unknown;
    service.login('admin', 'wrong-password').subscribe((user) => result = user);

    httpTestingController.expectOne('/api/auth.json').flush({
      accounts: [{ username: 'admin', password: 'admin123', displayName: 'Admin' }],
    });

    expect(result).toBeNull();
  });
});
