import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppRoutingModule } from "../app-routing.module";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { HeaderComponent } from "./header/header.component";
import { NewsDetailComponent } from "./news/news-detail/news-detail.component";
import { NewsListComponent } from "./news/news-list/news-list.component";
import { PageCountComponent } from "./news/news-list/page-count/page-count.component";
import { SiteComponent } from "./site.component";
import { AuthInterceptorService } from "./auth/auth-interceptor.service";
import { SharedModule } from "../shared/shared.module";
import { ProfileComponent } from './profile/profile.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NewsCreateComponent } from './news/news-create/news-create.component';

@NgModule({
    declarations: [
        SiteComponent,
        HeaderComponent,
        DashboardComponent,
        NewsListComponent,
        PageCountComponent,
        NewsDetailComponent,
        ProfileComponent,
        NewsCreateComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        RouterModule,
        SharedModule,
        NgbModule,
        BrowserAnimationsModule
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }],
    exports: []
})
export class SiteModule { }
