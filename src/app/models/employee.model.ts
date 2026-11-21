export interface Employee {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  basicSalary: number;
  status: 'Active' | 'Inactive' | 'Probation';
  group: string;
  description: string;
}
