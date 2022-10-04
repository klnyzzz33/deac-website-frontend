import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { AuthService } from '../auth/auth.service';
import { HeaderService } from './header.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    animations: [
        myAnimations.headerAppearDisappear
    ]
})
export class HeaderComponent implements AfterViewInit, OnDestroy {

    @ViewChild("header") header: ElementRef;

    @ViewChild("defaultTab") defaultTab: ElementRef;

    headerInvisible = false;

    urlChangeSubscription = new Subscription();

    isLoggedIn = false;

    supportNotificationCount: number = 0;

    supportNotificationCountSubscription = new Subscription();

    constructor(private http: HttpClient, private router: Router, private changeDetectorRef: ChangeDetectorRef, private elem: ElementRef, private authService: AuthService, private headerService: HeaderService) { }

    ngAfterViewInit(): void {
        this.isLoggedIn = this.isAdmin() || this.isClient();
        let segments = this.router.parseUrl(this.router.url).root.children[PRIMARY_OUTLET].segments;
        this.onSelectHeaderTab("header-" + segments[1].path);
        this.urlChangeSubscription = this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(event => event as NavigationEnd)
        )
            .subscribe((event) => {
                let segments = this.router.parseUrl(event.urlAfterRedirects).root.children[PRIMARY_OUTLET].segments;
                this.onSelectHeaderTab("header-" + segments[1].path);
            });
        this.changeDetectorRef.detectChanges();
        if (this.isClient()) {
            this.getClientNotifications();
        } else if (this.isAdmin()) {
            this.getAdminNotifications();
        }
    }

    onSelectHeaderTab(id: string) {
        let elements = this.elem.nativeElement.querySelectorAll('.nav-item');
        for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
        }
        let selectedHeaders = document.getElementsByClassName(id);
        for (var i = 0; i < selectedHeaders.length; i++) {
            selectedHeaders[i].parentElement.classList.add("active");
        }
    }

    onNavigate(destination: String) {
        this.router.navigate(["/site/" + destination]);
    }

    isAdmin() {
        return this.authService.hasAdminPrivileges();
    }

    isClient() {
        return this.authService.hasClientPrivileges();
    }

    @HostListener('body:scroll', ['$event'])
    checkHeaderPositionOnScroll(event: any) {
        this.headerInvisible = event.target.scrollTop >= window.innerHeight;
    }

    onLogout() {
        this.http.get(
            'http://localhost:8080/api/user/logout',
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData) => {
                    localStorage.clear();
                    setTimeout(() => {
                        this.router.navigate(['/site'])
                            .then(() => {
                                window.location.reload()
                            });
                    }, 1000);
                },
                error: (error) => {
                    console.log("Error logging out");
                    localStorage.clear();
                    this.router.navigate(['/site']);
                },
                complete: () => { }
            });
    }

    onNavigateToLogin() {
        this.router.navigate(['/home']);
    }

    getAdminNotifications() {
        this.http.get(
            'http://localhost:8080/api/admin/support/ticket/notifications',
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: number) => {
                    this.supportNotificationCount = responseData;
                    this.supportNotificationCountSubscription = this.headerService.getSupportNotificationCount()
                        .subscribe(value => {
                            this.supportNotificationCount += value;
                        });
                },
                error: (error) => { console.log("Error getting admin support notification count") },
                complete: () => { }
            });
    }

    getClientNotifications() {
        this.http.get(
            'http://localhost:8080/api/support/ticket/notifications',
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: number) => {
                    this.supportNotificationCount = responseData;
                    this.supportNotificationCountSubscription = this.headerService.getSupportNotificationCount()
                        .subscribe(value => {
                            this.supportNotificationCount += value;
                        });
                },
                error: (error) => { console.log("Error getting client support notification count") },
                complete: () => { }
            });
    }

    ngOnDestroy(): void {
        this.urlChangeSubscription.unsubscribe();
        if (this.supportNotificationCountSubscription) {
            this.supportNotificationCountSubscription.unsubscribe();
        }
    }

}
