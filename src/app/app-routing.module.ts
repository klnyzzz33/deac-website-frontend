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
import { NewsModifyComponent } from './site/news/news-modify/news-modify.component';
import { AdminDashboardComponent } from './site/admin/admin-dashboard/admin-dashboard.component';
import { CheckoutComponent } from './site/profile/checkout/checkout.component';
import { ForgotUsernameComponent } from './home/forgot-username/forgot-username.component';
import { UserInfoComponent } from './site/admin/user-info/user-info.component';
import { CreateReceiptComponent } from './site/admin/create-receipt/create-receipt.component';
import { SupportComponent } from './site/support/support.component';
import { TicketDetailComponent } from './site/support/ticket-detail/ticket-detail.component';
import { TicketCreateComponent } from './site/support/ticket-create/ticket-create.component';

const appRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'site'
    },
    {

        path: '',
        component: HomeComponent,
        children: [
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
                path: 'forgot-password',
                component: ForgotPasswordComponent
            },
            {
                path: 'forgot-username',
                component: ForgotUsernameComponent
            },
            {
                path: 'reset-password',
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
                canActivateChild: [AuthGuard],
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: ProfileComponent
                    },
                    {
                        path: 'checkout',
                        component: CheckoutComponent,
                    }
                ]
            },
            {
                path: 'support',
                component: SupportComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'support/ticket',
                component: TicketDetailComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'support/ticket/create',
                component: TicketCreateComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'admin',
                canActivateChild: [AuthGuard],
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'dashboard'
                    },
                    {
                        path: 'dashboard',
                        component: AdminDashboardComponent
                    },
                    {
                        path: 'user',
                        component: UserInfoComponent
                    },
                    {
                        path: 'user/create-receipt',
                        component: CreateReceiptComponent
                    },
                    {
                        path: 'news/create',
                        component: NewsCreateComponent
                    },
                    {
                        path: 'news/edit',
                        component: NewsModifyComponent
                    },
                    {
                        path: '**',
                        redirectTo: 'dashboard'
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
        redirectTo: 'site'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModule { }
