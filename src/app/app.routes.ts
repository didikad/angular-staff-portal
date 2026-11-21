import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AddEmployeeComponent } from './features/employees/add-employee.component';
import { EmployeeDetailComponent } from './features/employees/employee-detail.component';
import { EmployeeListComponent } from './features/employees/employee-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'employees' },
      { path: 'employees/add', component: AddEmployeeComponent },
      { path: 'employees/:username', component: EmployeeDetailComponent },
      { path: 'employees', component: EmployeeListComponent },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];


