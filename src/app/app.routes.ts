import { MainPageComponent } from './main-page/main-page.component';
import { StartPageComponent } from './start-page/start-page.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'start-page', component: StartPageComponent },
  { path: 'main-page', component: MainPageComponent },
  { path: '', redirectTo: '/start-page', pathMatch: 'full'},
  { path: '**', redirectTo: '/start-page'}
];
