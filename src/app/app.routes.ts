import { BoschDebugConsolePageComponent } from './bosch-debug-console-page/bosch-debug-console-page.component';
import { CaptureSettingsPageComponent } from './capture-settings-page/capture-settings-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { StartPageComponent } from './start-page/start-page.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'start-page', component: StartPageComponent },
  { path: 'main-page', component: MainPageComponent },
  { path: 'bosch-debug-console-page', component: BoschDebugConsolePageComponent },
  { path: 'capture-settings-page', component: CaptureSettingsPageComponent },
  { path: '', redirectTo: '/start-page', pathMatch: 'full'},
  { path: '**', redirectTo: '/start-page'}
];
