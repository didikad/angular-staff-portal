import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../api/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-employee.component.html',
})
export class AddEmployeeComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);

  readonly groups = ['Engineering', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'IT Support', 'Operations', 'Product', 'Legal', 'Customer Success'];
  readonly today = new Date().toISOString().slice(0, 10);
  groupSearch = '';
  submitted = false;
  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    birthDate: ['', Validators.required],
    basicSalary: [null as number | null, [Validators.required, Validators.min(0)]],
    status: ['', Validators.required],
    group: ['', Validators.required],
    description: ['', Validators.required],
  });

  get filteredGroups(): string[] {
    const search = this.groupSearch.trim().toLowerCase();
    return this.groups.filter((group) => group.toLowerCase().includes(search));
  }

  hasError(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted);
  }

  save(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.employeeService.getEmployees().subscribe((employees) => {
      const value = this.form.getRawValue();
      const employee: Employee = {
        ...value,
        birthDate: new Date(`${value.birthDate}T00:00:00`).toISOString(),
        basicSalary: Number(value.basicSalary),
        status: value.status as Employee['status'],
        description: new Date(value.description).toISOString(),
      };
      this.employeeService.addEmployee(employee);
      void this.router.navigate(['/dashboard/employees']);
    });
  }
}
