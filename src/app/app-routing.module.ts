import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './home/forgot-password/forgot-password.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './home/login/login.component';
import { RegisterComponent } from './home/register/register.component';
import { ResetPasswordComponent } from './home/reset-password/reset-password.component';
import { VerifyComponent } from './home/verify/verify.component';
import { DashboardComponent } from './site/dashboard/dashboard.component';
import { NewsDetailComponent } from './site/news/news-detail/news-detail.component';
import { NewsListComponent } from './site/news/news-list/news-list.component';
import { SiteComponent } from './site/site.component';

const appRoutes: Routes = [
  { 
    path: '', 
    component: HomeComponent 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  { 
    path: 'forgot', 
    component: ForgotPasswordComponent 
  },
  { 
    path: 'reset', 
    component: ResetPasswordComponent 
  },
  { 
    path: 'verify', 
    component: VerifyComponent 
  },
  {
    path: 'site',
    component: SiteComponent, 
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      { 
        path: 'news', 
        component: NewsListComponent 
      },
      { 
        path: 'news/:title', 
        component: NewsDetailComponent 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}