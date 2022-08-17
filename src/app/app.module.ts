import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './home/register/register.component';
import { LoginComponent } from './home/login/login.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './site/dashboard/dashboard.component';
import { AuthInterceptorService } from './auth/auth-interceptor';
import { PopupModalComponent } from './popup-modal/popup-modal.component';
import { HeaderComponent } from './header/header.component';
import { ForgotPasswordComponent } from './home/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './home/reset-password/reset-password.component';
import { PasswordsValidatorDirective } from './home/validation/passwords-validator.directive';
import { NewsListComponent } from './site/news/news-list/news-list.component';
import { PageCountComponent } from './site/news/news-list/page-count/page-count.component';
import { VerifyComponent } from './home/verify/verify.component';
import { NewsDetailComponent } from './site/news/news-detail/news-detail.component';
import { RouterModule } from '@angular/router';
import { SiteComponent } from './site/site.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    VerifyComponent,
    PasswordsValidatorDirective,
    SiteComponent,
    PopupModalComponent,
    HeaderComponent,
    DashboardComponent,
    NewsListComponent,
    PageCountComponent,
    NewsDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule {}