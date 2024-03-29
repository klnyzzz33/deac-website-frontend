import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppRoutingModule } from "../app-routing.module";
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
import { NewsModifyComponent } from './news/news-modify/news-modify.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { MembershipsPageCountComponent } from "./admin/admin-dashboard/memberships-page-count/memberships-page-count.component";
import { CheckoutComponent } from './profile/checkout/checkout.component';
import { UserInfoComponent } from './admin/user-info/user-info.component';
import { CreateReceiptComponent } from './admin/create-receipt/create-receipt.component';
import { SupportComponent } from './support/support.component';
import { SupportPageCountComponent } from './support/support-page-count/support-page-count.component';
import { TicketDetailComponent } from './support/ticket-detail/ticket-detail.component';
import { TicketCreateComponent } from './support/ticket-create/ticket-create.component';
import { HeaderService } from "./header/header.service";
import { SiteHomeComponent } from './site-home/site-home.component';
import { AboutComponent } from './about/about.component';
import { NewsletterUnsubscribeComponent } from './site-home/newsletter-unsubscribe/newsletter-unsubscribe.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        SiteComponent,
        HeaderComponent,
        SiteHomeComponent,
        NewsListComponent,
        PageCountComponent,
        NewsDetailComponent,
        NewsCreateComponent,
        NewsModifyComponent,
        ProfileComponent,
        CheckoutComponent,
        AdminDashboardComponent,
        MembershipsPageCountComponent,
        UserInfoComponent,
        CreateReceiptComponent,
        SupportComponent,
        SupportPageCountComponent,
        TicketDetailComponent,
        TicketCreateComponent,
        AboutComponent,
        NewsletterUnsubscribeComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        RouterModule,
        SharedModule,
        NgbModule,
        BrowserAnimationsModule
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }, HeaderService],
    exports: []
})
export class SiteModule { }
