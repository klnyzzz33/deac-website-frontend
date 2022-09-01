import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppRoutingModule } from "../app-routing.module";
import { SharedModule } from "../shared/shared.module";

import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { HomeComponent } from "./home.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { PasswordsValidatorDirective } from "./validation/passwords-validator.directive";
import { VerifyComponent } from "./verify/verify.component";
import { WelcomeComponent } from "./welcome/welcome.component";

@NgModule({
    declarations: [
        HomeComponent,
        WelcomeComponent,
        LoginComponent,
        RegisterComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        VerifyComponent,
        PasswordsValidatorDirective
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        SharedModule
    ],
    providers: [],
    exports: []
})
export class HomeModule { }
