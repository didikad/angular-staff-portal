import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmployeeService } from './employee.service';
import { Employee } from '../models/employee.model';

const STORAGE_KEY = 'employee-management-data';
const employee: Employee = {
  username: 'alya.pratama.001',
  firstName: 'Alya',
  lastName: 'Pratama',
  email: 'alya@example.test',
  birthDate: '1990-01-01T00:00:00.000Z',
  basicSalary: 8500000,
  status: 'Active',
  group: 'Engineering',
  description: '2024-01-01T00:00:00.000Z',
};

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmployeeService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem(STORAGE_KEY);
  });

  it('loads employees from the JSON endpoint and caches the response', () => {
    let result: Employee[] | undefined;
    service.getEmployees().subscribe((employees) => result = employees);

    const request = httpTestingController.expectOne('/api/employees.json');
    expect(request.request.method).toBe('GET');
    request.flush([employee]);

    expect(result).toEqual([employee]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([employee]);
  });

  it('uses saved employees without making another HTTP request', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([employee]));
    let result: Employee[] | undefined;

    service.getEmployees().subscribe((employees) => result = employees);

    expect(result).toEqual([employee]);
    httpTestingController.expectNone('/api/employees.json');
  });

  it('adds a new employee to the saved list', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([employee]));
    const newEmployee = { ...employee, username: 'budi.002', firstName: 'Budi' };

    service.addEmployee(newEmployee);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([newEmployee, employee]);
  });
});
