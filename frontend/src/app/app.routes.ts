import { Routes } from '@angular/router';
import {Layout} from './shared/layout/layout';
import {Main} from './views/main/main';
import {Login} from './views/user/login/login';
import {Signup} from './views/user/signup/signup';
import {Blog} from './views/blog/blog';
import {Article} from './views/article/article';
import {authForwardGuard} from './core/auth/auth-forward-guard';
import { TermsOfService } from './views/terms-of-service/terms-of-service';


export const routes: Routes = [
  {
    path: '', component: Layout,
    children: [
      {path: '', component: Main},
      { path: 'blog', component: Blog,  runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      { path: 'blog/:url', component: Article },
      {path: 'login', component: Login, canActivate: [authForwardGuard]},
      {path: 'signup', component: Signup, canActivate: [authForwardGuard]},
      {path: 'terms', component: TermsOfService},
    ]
  },
];
