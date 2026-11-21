import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Employee } from '../models/employee.model';

const STORAGE_KEY = 'employee-management-data';
const DATA_URL = '/api/employees.json';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  getEmployees(): Observable<Employee[]> {
    const savedEmployees = this.readSavedEmployees();
    if (savedEmployees) return of(savedEmployees);

    return this.http.get<Employee[]>(DATA_URL).pipe(
      tap((employees) => this.saveEmployees(employees)),
    );
  }

  addEmployee(employee: Employee): void {
    const employees = this.readSavedEmployees() ?? [];
    this.saveEmployees([employee, ...employees]);
  }

  private readSavedEmployees(): Employee[] | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as Employee[] : null;
    } catch {
      return null;
    }
  }

  private saveEmployees(employees: Employee[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }
}
