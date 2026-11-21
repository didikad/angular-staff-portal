import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthAccount, AuthUser } from '../models/auth.model';

interface AuthResponse {
  accounts: AuthAccount[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<AuthUser | null> {
    return this.http.get<AuthResponse>('/api/auth.json').pipe(
      map(({ accounts }) => {
        const account = accounts.find((item) =>
          item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password,
        );

        if (!account) return null;

        return {
          username: account.username,
          displayName: account.displayName,
        };
      }),
    );
  }
}
