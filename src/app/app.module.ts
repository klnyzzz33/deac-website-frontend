import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HomeModule } from './home/home.module';
import { SiteModule } from './site/site.module';
import { SharedModule } from './shared/shared.module';
import { AuthService } from './site/auth/auth.service';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        RouterModule,
        HomeModule,
        SiteModule,
        SharedModule
    ],
    providers: [AuthService],
    bootstrap: [AppComponent]
})
export class AppModule { }
