import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("header") header: ElementRef;

    @ViewChild("defaultTab") defaultTab: ElementRef;

    @ViewChild("searchelement") searchElement: ElementRef;

    @ViewChild("languageselect") languageSelectElement: ElementRef;

    toggleInProgress = false;

    headerInvisible = false;

    urlChangeSubscription = new Subscription();

    isLoggedIn = false;

    supportNotificationCount: number = 0;

    supportNotificationCountSubscription = new Subscription();

    searchTerm = "";

    searchResults: {
        results: {
            id: number,
            title: string,
            indexImageUrl: string
        }[],
        numberOfResults: number
    } = {
            results: [],
            numberOfResults: 0
        };

    isSmallScreen = false;

    searchResultsElementDisplay: boolean = false;

    searchMaxEntries = 10;

    availableLanguages = ["EN", "HU"];

    currentLanguage = "";

    otherLanguageOptions = [];

    languageOptionsDisplay: boolean = false;

    constructor(private http: HttpClient, private router: Router, private changeDetectorRef: ChangeDetectorRef, private elem: ElementRef, private authService: AuthService, private headerService: HeaderService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.availableLanguages.sort();
        this.currentLanguage = this.translate.currentLang.toUpperCase();
        this.otherLanguageOptions = this.availableLanguages.filter(s => s != this.currentLanguage);
        this.onResize(null);
    }

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
            this.supportNotificationCountSubscription = this.headerService.getSupportNotificationCount()
                .subscribe(value => {
                    this.supportNotificationCount += value;
                });
        } else if (this.isAdmin()) {
            this.getAdminNotifications();
            this.supportNotificationCountSubscription = this.headerService.getSupportNotificationCount()
                .subscribe(value => {
                    this.supportNotificationCount += value;
                });
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
        if (this.isClient()) {
            this.getClientNotifications();
        } else if (this.isAdmin()) {
            this.getAdminNotifications();
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
                    let lang = localStorage.getItem("language");
                    localStorage.clear();
                    if (lang) {
                        localStorage.setItem("language", lang);
                    }
                    setTimeout(() => {
                        this.router.navigate(['/site'])
                            .then(() => {
                                window.location.reload()
                            });
                    }, 1000);
                },
                error: (error) => {
                    console.log("Error logging out");
                    let lang = localStorage.getItem("language");
                    localStorage.clear();
                    if (lang) {
                        localStorage.setItem("language", lang);
                    }
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
                },
                error: (error) => { console.log("Error getting client support notification count") },
                complete: () => { }
            });
    }

    onSearchNews() {
        if (this.searchTerm.length < 3) {
            this.searchResultsElementDisplay = false;
            return;
        }

        let params = new HttpParams().set("title", this.searchTerm).set("entriesPerPage", this.searchMaxEntries);
        this.http.get(
            'http://localhost:8080/api/news/search/top',
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: {
                    results: {
                        id: number,
                        title: string,
                        indexImageUrl: string
                    }[],
                    numberOfResults: number
                }) => {
                    this.searchResults = responseData;
                    this.searchResultsElementDisplay = true;
                },
                error: (error) => { console.log("Error searching for keywords") },
                complete: () => { }
            });
    }

    handleEnterPress(event: KeyboardEvent) {
        if (event.key == "Enter") {
            this.onNavigateToSearchResults();
        }
    }

    onNavigateToSearchResults() {
        if (this.searchTerm.length < 3) {
            return;
        }

        localStorage.setItem("pageCounter", "1");
        this.router.navigate(['/site/news'], {
            queryParams: {
                search: this.searchTerm
            }
        })
            .then(() => {
                window.location.reload();
            });
    }

    onOpenNews(title: string, id: number) {
        setTimeout(() => {
            this.router.navigate(['/site/news', title], {
                queryParams: {
                    id: id
                }
            })
                .then(() => {
                    this.searchTerm = "";
                    this.searchResultsElementDisplay = false;
                });
        }, 500);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 1500) {
            this.isSmallScreen = true;
        } else {
            this.isSmallScreen = false;
        }
    }

    @HostListener('document:click', ['$event'])
    clickOutsideSearchbar(event) {
        if (!this.searchElement.nativeElement.contains(event.target)) {
            this.searchResultsElementDisplay = false;
            this.searchTerm = "";
        }
        if (!this.languageSelectElement.nativeElement.contains(event.target) && !this.toggleInProgress) {
            this.languageOptionsDisplay = false;
        }
        this.toggleInProgress = false;
    }

    toggleDropdown() {
        this.toggleInProgress = true;
        this.languageOptionsDisplay = !this.languageOptionsDisplay;
    }

    setLanguage(lang: string) {
        localStorage.setItem("language", lang.toLowerCase());
        this.translate.use(lang.toLowerCase());
        this.currentLanguage = lang;
        this.otherLanguageOptions = this.availableLanguages.filter(s => s != this.currentLanguage);
        this.otherLanguageOptions.sort();
        this.languageOptionsDisplay = false;
        window.location.reload();
    }

    ngOnDestroy(): void {
        this.urlChangeSubscription.unsubscribe();
        if (this.supportNotificationCountSubscription) {
            this.supportNotificationCountSubscription.unsubscribe();
        }
    }

}
