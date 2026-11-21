import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EmployeeService } from '../../api/employee.service';
import { Employee } from '../../models/employee.model';
import { AddEmployeeComponent } from './add-employee.component';

const savedEmployees: Employee[] = [];

describe('AddEmployeeComponent', () => {
  let component: AddEmployeeComponent;
  const employeeService = {
    getEmployees: vi.fn(() => of(savedEmployees)),
    addEmployee: vi.fn(),
  };
  let router: Router;

  beforeEach(async () => {
    employeeService.getEmployees.mockReturnValue(of(savedEmployees));
    employeeService.addEmployee.mockClear();

    await TestBed.configureTestingModule({
      imports: [AddEmployeeComponent],
      providers: [
        provideRouter([]),
        { provide: EmployeeService, useValue: employeeService },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component = TestBed.createComponent(AddEmployeeComponent).componentInstance;
  });

  it('filters the group options by the search text', () => {
    component.groupSearch = 'engine';
    expect(component.filteredGroups).toEqual(['Engineering']);
  });

  it('does not save an invalid form and marks it submitted', () => {
    component.save();

    expect(component.submitted).toBe(true);
    expect(employeeService.addEmployee).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('saves a valid employee and returns to the employee list', () => {
    component.form.setValue({
      username: 'dina.004',
      firstName: 'Dina',
      lastName: 'Putri',
      email: 'dina@example.test',
      birthDate: '1995-04-05T08:30',
      basicSalary: 7500000,
      status: 'Active',
      group: 'Engineering',
      description: '2025-06-07T08:09',
    });

    component.save();

    expect(employeeService.addEmployee).toHaveBeenCalledWith({
      username: 'dina.004',
      firstName: 'Dina',
      lastName: 'Putri',
      email: 'dina@example.test',
      birthDate: new Date('1995-04-05T08:30').toISOString(),
      basicSalary: 7500000,
      status: 'Active',
      group: 'Engineering',
      description: new Date('2025-06-07T08:09').toISOString(),
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/employees']);
  });
});





