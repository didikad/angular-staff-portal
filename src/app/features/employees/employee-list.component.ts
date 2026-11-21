import { Component, inject, signal } from '@angular/core';
import { EmployeeService } from '../../api/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  templateUrl: './employee-list.component.html',
})
export class EmployeeListComponent {
  private readonly employeeService = inject(EmployeeService);
  readonly employees = signal<Employee[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  constructor() {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Data karyawan tidak berhasil dimuat. Periksa file public/api/employees.json.');
        this.loading.set(false);
      },
    });
  }

  formatSalary(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  }
}
