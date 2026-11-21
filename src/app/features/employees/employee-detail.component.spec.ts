import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EmployeeService } from '../../api/employee.service';
import { Employee } from '../../models/employee.model';
import { EmployeeDetailComponent } from './employee-detail.component';

const employee: Employee = {
  username: 'alya.001',
  firstName: 'Alya',
  lastName: 'Pratama',
  email: 'alya@example.test',
  birthDate: '1990-01-01T00:00:00.000Z',
  basicSalary: 8500000,
  status: 'Active',
  group: 'Engineering',
  description: '2024-01-01T00:00:00.000Z',
};

describe('EmployeeDetailComponent', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<EmployeeDetailComponent>>;
  const employeeService = { getEmployees: vi.fn(() => of([employee])) };
  const route = {
  snapshot: {
    paramMap: { get: vi.fn(() => employee.username) },
    queryParams: { search: 'Alya', group: 'Engineering', status: 'Active', page: '2' },
  },
};

  beforeEach(async () => {
    employeeService.getEmployees.mockReturnValue(of([employee]));
    route.snapshot.paramMap.get.mockReturnValue(employee.username);
    await TestBed.configureTestingModule({
      imports: [EmployeeDetailComponent],
      providers: [
        provideRouter([]),
        { provide: EmployeeService, useValue: employeeService },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();
  });

  it('shows the employee identified by the route username', () => {
    fixture = TestBed.createComponent(EmployeeDetailComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.employee()).toEqual(employee);
    expect(fixture.componentInstance.returnQueryParams).toEqual(route.snapshot.queryParams);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Alya Pratama');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('alya@example.test');
  });

  it('shows the not-found state when the username is unknown', () => {
    route.snapshot.paramMap.get.mockReturnValue('missing.user');
    fixture = TestBed.createComponent(EmployeeDetailComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.employee()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Karyawan tidak ditemukan');
  });
});
