import { Component, computed, inject, signal } from '@angular/core';
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
  readonly searchText = signal('');
  readonly selectedGroup = signal('');
  readonly selectedStatus = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly sortColumn = signal<keyof Employee>('firstName');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly groups = computed(() => [...new Set(this.employees().map((employee) => employee.group))].sort());

  readonly filteredEmployees = computed(() => {
    const search = this.searchText().trim().toLocaleLowerCase('id-ID');
    const filtered = this.employees().filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLocaleLowerCase('id-ID');
      const matchesText = !search || fullName.includes(search) || employee.username.toLocaleLowerCase('id-ID').includes(search);
      const matchesGroup = !this.selectedGroup() || employee.group === this.selectedGroup();
      const matchesStatus = !this.selectedStatus() || employee.status === this.selectedStatus();
      return matchesText && matchesGroup && matchesStatus;
    });

    const column = this.sortColumn();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return filtered.sort((left, right) => {
      const first = left[column];
      const second = right[column];
      const comparison = typeof first === 'number' && typeof second === 'number'
        ? first - second
        : String(first).localeCompare(String(second), 'id-ID');
      return comparison * direction;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredEmployees().length / this.pageSize())));
  readonly pageEmployees = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredEmployees().slice(start, start + this.pageSize());
  });

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

  updateSearch(value: string): void {
    this.searchText.set(value);
    this.page.set(1);
  }

  updateGroup(value: string): void {
    this.selectedGroup.set(value);
    this.page.set(1);
  }

  updateStatus(value: string): void {
    this.selectedStatus.set(value);
    this.page.set(1);
  }

  updatePageSize(value: string): void {
    this.pageSize.set(Number(value));
    this.page.set(1);
  }

  sortBy(column: keyof Employee): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.page.set(page);
  }

  formatSalary(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  }

  statusText(status: Employee['status']): string {
    if (status === 'Active') return 'Aktif';
    if (status === 'Inactive') return 'Nonaktif';
    return 'Probation';
  }
}


