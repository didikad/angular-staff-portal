import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EmployeeService } from '../../api/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './employee-detail.component.html',
})
export class EmployeeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly employeeService = inject(EmployeeService);
  readonly employee = signal<Employee | null>(null);
  readonly loading = signal(true);

  constructor() {
    const username = this.route.snapshot.paramMap.get('username');
    this.employeeService.getEmployees().subscribe((employees) => {
      this.employee.set(employees.find((item) => item.username === username) ?? null);
      this.loading.set(false);
    });
  }

  formatSalary(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(value).replace('Rp', 'Rp.');
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value));
  }
}
