import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './site/auth/auth-guard.service';
import { ForgotPasswordComponent } from './home/forgot-password/forgot-password.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './home/login/login.component';
import { RegisterComponent } from './home/register/register.component';
import { ResetPasswordComponent } from './home/reset-password/reset-password.component';
import { VerifyComponent } from './home/verify/verify.component';
import { WelcomeComponent } from './home/welcome/welcome.component';
import { DashboardComponent } from './site/dashboard/dashboard.component';
import { NewsDetailComponent } from './site/news/news-detail/news-detail.component';
import { NewsListComponent } from './site/news/news-list/news-list.component';
import { ProfileComponent } from './site/profile/profile.component';
import { SiteComponent } from './site/site.component';
import { NewsCreateComponent } from './site/news/news-create/news-create.component';

const appRoutes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'home'
            },
            {
                path: 'home',
                component: WelcomeComponent
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
            }
        ]
    },
    {
        path: 'site',
        component: SiteComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard'
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'news',
                component: NewsListComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'news/:title',
                component: NewsDetailComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'profile',
                component: ProfileComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'admin',
                canActivateChild: [AuthGuard],
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'news/create'
                    },
                    {
                        path: 'news/create',
                        component: NewsCreateComponent
                    }
                ]
            },
            {
                path: '**',
                redirectTo: 'dashboard'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModule { }
