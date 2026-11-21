import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EmployeeService } from '../../api/employee.service';
import { Employee } from '../../models/employee.model';
import { EmployeeListComponent } from './employee-list.component';

const employees: Employee[] = [
  { username: 'alice.001', firstName: 'Alice', lastName: 'Adams', email: 'alice@example.test', birthDate: '1990-01-01T00:00:00.000Z', basicSalary: 100, status: 'Active', group: 'Engineering', description: '2024-01-01T00:00:00.000Z' },
  { username: 'budi.002', firstName: 'Budi', lastName: 'Bima', email: 'budi@example.test', birthDate: '1991-02-02T00:00:00.000Z', basicSalary: 200, status: 'Inactive', group: 'Human Resources', description: '2024-01-01T00:00:00.000Z' },
  { username: 'citra.003', firstName: 'Citra', lastName: 'Candra', email: 'citra@example.test', birthDate: '1992-03-03T00:00:00.000Z', basicSalary: 150, status: 'Active', group: 'Engineering', description: '2024-01-01T00:00:00.000Z' },
];

describe('EmployeeListComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<EmployeeListComponent>>;
  let component: EmployeeListComponent;
  let router: Router;
  const employeeService = { getEmployees: vi.fn(() => of(employees)) };

  beforeEach(async () => {
    employeeService.getEmployees.mockReturnValue(of(employees));
    await TestBed.configureTestingModule({
      imports: [EmployeeListComponent],
      providers: [provideRouter([]), { provide: EmployeeService, useValue: employeeService }],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads employees and renders Detail, Edit, and Delete actions for each row', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(component.loading()).toBe(false);
    expect(component.employees()).toHaveLength(3);
    expect(element.querySelectorAll('thead th')).toHaveLength(7);
    expect(element.querySelectorAll('tbody a')).toHaveLength(3);
    expect(element.querySelectorAll('tbody button')).toHaveLength(6);
    expect(element.querySelector('tbody a')?.textContent?.trim()).toBe('Detail');
  });

  it('filters by search text, group, and status together', () => {
    component.updateSearch('CITRA');
    component.updateGroup('Engineering');
    component.updateStatus('Active');

    expect(component.filteredEmployees().map((employee) => employee.username)).toEqual(['citra.003']);
  });

  it('sorts employees and changes direction when sorting the same column again', () => {
    component.sortBy('basicSalary');
    expect(component.filteredEmployees().map((employee) => employee.basicSalary)).toEqual([100, 150, 200]);

    component.sortBy('basicSalary');
    expect(component.filteredEmployees().map((employee) => employee.basicSalary)).toEqual([200, 150, 100]);
  });

  it('paginates results and prevents moving outside the valid page range', () => {
    component.updatePageSize('2');
    component.changePage(2);
    expect(component.page()).toBe(2);
    expect(component.pageEmployees().map((employee) => employee.username)).toEqual(['citra.003']);

    component.changePage(3);
    expect(component.page()).toBe(2);
    component.changePage(1);
    expect(component.page()).toBe(1);
  });

  it('shows amber Edit and red Delete notifications', () => {
    component.showActionNotification('edit', employees[0]);
    fixture.detectChanges();
    let notification = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(notification.textContent).toContain('Aksi Edit');
    expect(notification.classList.contains('bg-amber-100')).toBe(true);

    component.showActionNotification('delete', employees[0]);
    fixture.detectChanges();
    notification = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(notification.textContent).toContain('Aksi Delete');
    expect(notification.classList.contains('bg-red-100')).toBe(true);
  });

  it('restores a selected group after its options are loaded', () => {
    const supportEmployee = { ...employees[0], group: 'IT Support' };
    component.employees.set([]);
    component.updateGroup('IT Support');
    fixture.detectChanges();

    component.employees.set([supportEmployee]);
    fixture.detectChanges();

    const groupSelect = (fixture.nativeElement as HTMLElement).querySelectorAll('select')[0] as HTMLSelectElement;
    expect(groupSelect.value).toBe('IT Support');
  });

  it('writes the selected group to the current URL using replaceUrl', () => {
    component.updateGroup('IT Support');

    expect(router.navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: expect.objectContaining({ group: 'IT Support' }),
      replaceUrl: true,
    }));
  });

  it('keeps current search filters in detail navigation query parameters', () => {
    component.updateSearch('Citra');
    component.updateGroup('Engineering');
    component.updateStatus('Active');
    component.updatePageSize('25');
    component.changePage(1);

    expect(component.listQueryParams()).toMatchObject({
      search: 'Citra',
      group: 'Engineering',
      status: 'Active',
      pageSize: 25,
    });
  });

  it('resets to the first page when a filter changes', () => {
    component.updatePageSize('1');
    component.changePage(2);
    component.updateSearch('Alice');

    expect(component.page()).toBe(1);
    expect(component.pageEmployees().map((employee) => employee.username)).toEqual(['alice.001']);
  });
});
