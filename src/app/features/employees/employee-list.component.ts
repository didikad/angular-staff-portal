import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../api/employee.service';
import { Employee } from '../../models/employee.model';

type EmployeeAction = 'edit' | 'delete';
type SortColumn = 'firstName' | 'username' | 'group' | 'status' | 'basicSalary';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './employee-list.component.html',
})
export class EmployeeListComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly employees = signal<Employee[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly notification = signal<{ type: EmployeeAction; message: string } | null>(null);
  readonly searchText = signal('');
  readonly selectedGroup = signal('');
  readonly selectedStatus = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly sortColumn = signal<keyof Employee>('firstName');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly groups = computed(() => [...new Set(this.employees().map((employee) => employee.group))].sort());
  readonly listQueryParams = computed(() => ({
    search: this.searchText() || null,
    group: this.selectedGroup() || null,
    status: this.selectedStatus() || null,
    page: this.page() === 1 ? null : this.page(),
    pageSize: this.pageSize() === 10 ? null : this.pageSize(),
    sort: this.sortColumn() === 'firstName' ? null : this.sortColumn(),
    direction: this.sortDirection() === 'asc' ? null : this.sortDirection(),
  }));

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
    const query = this.route.snapshot.queryParamMap;
    this.searchText.set(query.get('search') ?? '');
    this.selectedGroup.set(query.get('group') ?? '');
    this.selectedStatus.set(query.get('status') ?? '');

    const requestedPageSize = Number(query.get('pageSize'));
    if ([10, 25, 50].includes(requestedPageSize)) this.pageSize.set(requestedPageSize);

    const requestedPage = Number(query.get('page'));
    if (Number.isInteger(requestedPage) && requestedPage > 0) this.page.set(requestedPage);

    const requestedSort = query.get('sort');
    const sortableColumns: SortColumn[] = ['firstName', 'username', 'group', 'status', 'basicSalary'];
    if (sortableColumns.includes(requestedSort as SortColumn)) {
      this.sortColumn.set(requestedSort as SortColumn);
    }
    if (query.get('direction') === 'desc') this.sortDirection.set('desc');

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        if (this.page() > this.totalPages()) this.page.set(this.totalPages());
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
    this.syncQueryParams();
  }

  updateGroup(value: string): void {
    this.selectedGroup.set(value);
    this.page.set(1);
    this.syncQueryParams();
  }

  updateStatus(value: string): void {
    this.selectedStatus.set(value);
    this.page.set(1);
    this.syncQueryParams();
  }

  updatePageSize(value: string): void {
    this.pageSize.set(Number(value));
    this.page.set(1);
    this.syncQueryParams();
  }

  sortBy(column: keyof Employee): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.syncQueryParams();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.page.set(page);
      this.syncQueryParams();
    }
  }

  private syncQueryParams(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.listQueryParams(),
      replaceUrl: true,
    });
  }

  showActionNotification(action: EmployeeAction, employee: Employee): void {
    const name = `${employee.firstName} ${employee.lastName}`;
    const message = action === 'edit'
      ? `Aksi Edit untuk ${name} belum memiliki halaman edit.`
      : `Aksi Delete untuk ${name} hanya contoh dan tidak menghapus data.`;
    this.notification.set({ type: action, message });
  }

  dismissNotification(): void {
    this.notification.set(null);
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
