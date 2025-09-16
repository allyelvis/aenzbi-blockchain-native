import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'wallet',
    loadComponent: () =>
      import('./wallet/wallet.component').then((m) => m.WalletComponent),
  },
  {
    path: 'explorer',
    loadComponent: () =>
      import('./explorer/explorer.component').then((m) => m.ExplorerComponent),
  },
  {
    path: 'dapps',
    loadComponent: () =>
      import('./dapps/dapps.component').then((m) => m.DappsComponent),
  },
  {
    path: 'asset/:address',
    loadComponent: () =>
      import('./asset-detail/asset-detail.component').then((m) => m.AssetDetailComponent),
  },
  {
    path: 'ai-maintainer',
    loadComponent: () =>
      import('./ai-maintainer/ai-maintainer.component').then((m) => m.AiMaintainerComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
