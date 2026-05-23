import type { Routes } from '@angular/router';
import { APP_CONFIG } from './core/config/app-config';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

export const routes: Routes = [
  {
    path: APP_CONFIG.routes.welcome,
    component: WelcomeComponent,
    title: APP_CONFIG.titles.welcome,
  },
  {
    path: APP_CONFIG.routes.play,
    loadChildren: () => import('./features/game/game.routes').then((m) => m.gameRoutes),
    title: APP_CONFIG.titles.play,
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: APP_CONFIG.titles.notFound,
  },
];
