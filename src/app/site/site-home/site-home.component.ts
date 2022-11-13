import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopupModalComponent } from 'src/app/shared/popup-modal/popup-modal.component';
import { PopupModalService } from 'src/app/shared/popup-modal/popup-modal.service';
import { AuthService } from '../auth/auth.service';

@Component({
    selector: 'app-site-home',
    templateUrl: './site-home.component.html',
    styleUrls: ['./site-home.component.css']
})
export class SiteHomeComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild("subscribesuccesspopup") subscribeSuccessPopup: PopupModalComponent;

    @ViewChild("unsubscribesuccesspopup") unsubscribeSuccessPopup: PopupModalComponent;

    @ViewChild("featurednews") featuredNewsElement: ElementRef;

    subscribePopupName = "subscribefeedback";

    unsubscribePopupName = "unsubscribefeedback"

    errorMessage: string = null;

    email = "";

    isAdmin = false;

    isClient = false;

    isClientSubscribed = false;

    isUnsubscribeSuccessful = null;

    unsubscribeErrorMessage = null;

    numberOfFeaturedNews = 5;

    featuredNews: {
        newsId: number,
        title: string,
        description: string,
        content: string,
        indexImageUrl: string,
        author: string,
        createDate: string,
        lastModified: {
            modifyDate: string,
            modifyAuthor: string
        }
    }[] = [];

    invisibleItems: number[] = [];

    canNavigateLeft = false;

    canNavigateRight = false;

    constructor(private http: HttpClient, private router: Router, private authService: AuthService, private popupModalService: PopupModalService, private changeDetectorRef: ChangeDetectorRef, private translate: TranslateService) {
        let currentNavigation = this.router.getCurrentNavigation();
        if (currentNavigation != null && currentNavigation.extras["state"]) {
            if (currentNavigation.extras.state["isUnsubscribeSuccessful"]) {
                this.isUnsubscribeSuccessful = true;
            } else if (currentNavigation.extras.state.isUnsubscribeSuccessful === false) {
                this.isUnsubscribeSuccessful = false;
            }
        }
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasAdminPrivileges();
        this.isClient = this.authService.hasClientPrivileges();
        if (!this.isAdmin && this.isClient) {
            this.isClientSubscribedToNewsLetter();
        }
        if (this.isUnsubscribeSuccessful === false) {
            this.translate.get("site.sitehome.error.unsubscribe")
                .subscribe((value: string) => {
                    this.unsubscribeErrorMessage = value;
                });
        }
        this.getFeaturedNews();
    }

    ngAfterViewInit(): void {
        if (!this.isAdmin) {
            this.popupModalService.setModal(this.subscribePopupName, this.subscribeSuccessPopup);
            this.popupModalService.setModal(this.unsubscribePopupName, this.unsubscribeSuccessPopup);
        }
        if (this.isUnsubscribeSuccessful) {
            this.popupModalService.openPopup(this.unsubscribePopupName);
        }
    }

    redirectToRegister() {
        this.router.navigate(['/register']);
    }

    redirectToLogin() {
        this.router.navigate(['/login']);
    }

    onNavigateToAbout() {
        this.router.navigate(['/site/about']);
    }

    onSubmit(form: NgForm) {
        if (form.form.invalid) {
            this.translate.get("site.sitehome.error.subscribe")
                .subscribe((value: string) => {
                    this.errorMessage = value;
                });
            return;
        }
        this.errorMessage = null;

        let params = new HttpParams().set("language", this.translate.currentLang.toUpperCase());
        this.http.post(
            'http://localhost:8080/api/mailinglist/subscribe',
            form.form.value.email,
            {
                withCredentials: true,
                responseType: 'json',
                params: params
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.subscribePopupName);
                },
                error: (error) => { this.errorMessage = error.error },
                complete: () => { }
            });
    }

    isClientSubscribedToNewsLetter() {
        this.http.post(
            'http://localhost:8080/api/mailinglist/client/check_subscription',
            null,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData: boolean) => { this.isClientSubscribed = responseData },
                error: (error) => { console.log("Error checking mailing list subscription") },
                complete: () => { }
            });
    }

    clientSubscribeNewsLetter() {
        this.http.post(
            'http://localhost:8080/api/mailinglist/client/subscribe',
            null,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.subscribePopupName);
                },
                error: (error) => { console.log("Error subscribing to mailing list") },
                complete: () => { }
            });
    }

    clientUnsubscribeNewsLetter() {
        this.http.post(
            'http://localhost:8080/api/mailinglist/client/unsubscribe',
            null,
            {
                withCredentials: true,
                responseType: 'json'
            }
        )
            .subscribe({
                next: (responseData) => {
                    this.popupModalService.openPopup(this.unsubscribePopupName);
                },
                error: (error) => { console.log("Error unsubscribing from mailing list") },
                complete: () => { }
            });
    }

    closePopup(name: string) {
        this.popupModalService.closePopup(name);
        window.location.reload();
    }

    getFeaturedNews() {
        let params = new HttpParams().set("entriesPerPage", this.numberOfFeaturedNews);
        this.http.get(
            'http://localhost:8080/api/news/top/home',
            {
                withCredentials: true,
                params: params
            }
        )
            .subscribe({
                next: (responseData: {
                    newsId: number,
                    title: string,
                    description: string,
                    content: string,
                    indexImageUrl: string,
                    author: string,
                    createDate: string,
                    lastModified: {
                        modifyDate: string,
                        modifyAuthor: string
                    }
                }[]) => {
                    this.featuredNews = responseData;
                    this.numberOfFeaturedNews = responseData.length;
                    this.featuredNews.forEach((news) => {
                        news["position"] = "hidden";
                    });
                    if (this.featuredNews.length > 0) {
                        this.featuredNews[0]["position"] = "featured-news-entry-middle";
                        if (this.featuredNews.length > 1) {
                            this.featuredNews[1]["position"] = "featured-news-entry-last";
                            if (this.featuredNews.length > 2) {
                                this.featuredNews[this.featuredNews.length - 1]["position"] = "featured-news-entry-first";
                                this.canNavigateLeft = true;
                                this.canNavigateRight = true;
                                this.addExtraElements();
                            } else {
                                this.canNavigateRight = true;
                            }
                        }
                        this.onResize(null);
                    }
                    for (var i = 0; i < this.featuredNews.length; i++) {
                        if (this.featuredNews[i]["position"] == "hidden") {
                            this.invisibleItems.push(i);
                        }
                    }
                },
                error: (error) => { console.log("Error getting featured news") },
                complete: () => { }
            });
    }

    addExtraElements() {
        this.featuredNews.push(structuredClone(this.featuredNews[2]));
        this.featuredNews[this.featuredNews.length - 1]["position"] = "featured-news-entry-last-invisible";
        this.featuredNews.push(structuredClone(this.featuredNews[this.featuredNews.length - 3]));
        this.featuredNews[this.featuredNews.length - 1]["position"] = "featured-news-entry-first-invisible";
        this.changeDetectorRef.detectChanges();
    }

    switchWithLeftArrow() {
        this.disableNavigation();
        let middleIndex = null;
        let lastIndex = null;
        let firstIndex = null;
        let lastInvisibleIndex = null;
        let firstInvisibleIndex = null;
        let invisibleItemsCopy = structuredClone(this.invisibleItems);
        let tmp1 = null;
        let tmp2 = invisibleItemsCopy[invisibleItemsCopy.length - 1];
        let tmp3 = null;
        let oldLastIndex = null;
        if (this.numberOfFeaturedNews <= 3) {
            for (var i = 0; i < this.featuredNews.length; i++) {
                if (this.featuredNews[i]["position"] == "featured-news-entry-last-invisible") {
                    oldLastIndex = i;
                    break;
                }
            }
        }
        for (var i = 0; i < this.featuredNews.length; i++) {
            let news = this.featuredNews[i];
            switch (news["position"]) {
                case "featured-news-entry-middle":
                    news["position"] = "featured-news-entry-middle featured-news-entry-slideright";
                    lastIndex = i;
                    setTimeout(() => {
                        news["position"] = "featured-news-entry-last";
                        if (this.numberOfFeaturedNews <= 3) {
                            this.featuredNews[oldLastIndex] = structuredClone(news);
                            this.featuredNews[oldLastIndex]["position"] = "featured-news-entry-first-invisible";
                        }
                    }, 700);
                    break;
                case "featured-news-entry-last":
                    news["position"] = "featured-news-entry-last-fadeaway";
                    lastInvisibleIndex = i;
                    tmp1 = i;
                    setTimeout(() => {
                        news["position"] = "featured-news-entry-last-invisible";
                        if (this.numberOfFeaturedNews > 3) {
                            invisibleItemsCopy.unshift(tmp1);
                        }
                    }, 700);
                    break;
                case "featured-news-entry-first":
                    news["position"] = "featured-news-entry-first featured-news-entry-slideright";
                    middleIndex = i;
                    setTimeout(() => {
                        news["position"] = "featured-news-entry-middle";
                    }, 700);
                    break;
                case "featured-news-entry-last-invisible":
                    tmp2 = i;
                    break;
                case "featured-news-entry-first-invisible":
                    news["position"] = "featured-news-entry-first-fadein";
                    firstIndex = i;
                    setTimeout(() => {
                        news["position"] = "featured-news-entry-first";
                        if (this.numberOfFeaturedNews > 3) {
                            invisibleItemsCopy.pop();
                        }
                    }, 700);
                    break;
                case "hidden":
                    if (i == invisibleItemsCopy[invisibleItemsCopy.length - 1]) {
                        tmp3 = i;
                    }
                    break;
            }
        }
        if (this.numberOfFeaturedNews > 3) {
            setTimeout(() => {
                this.featuredNews[tmp2] = structuredClone(this.featuredNews[invisibleItemsCopy[0]]);
                this.featuredNews[tmp2]["position"] = "hidden";
                this.featuredNews[tmp3] = structuredClone(this.featuredNews[invisibleItemsCopy[invisibleItemsCopy.length - 1]]);
                this.featuredNews[tmp3]["position"] = "featured-news-entry-first-invisible";
                firstInvisibleIndex = tmp3;
                let tmp = [this.featuredNews[middleIndex], this.featuredNews[lastIndex]];
                tmp.push(this.featuredNews[tmp2]);
                for (var i = 1; i < invisibleItemsCopy.length; i++) {
                    tmp.push(this.featuredNews[invisibleItemsCopy[i]]);
                }
                tmp.push(this.featuredNews[firstIndex], this.featuredNews[lastInvisibleIndex], this.featuredNews[firstInvisibleIndex]);
                this.featuredNews = tmp;
                this.canNavigateLeft = true;
                this.canNavigateRight = true;
            }, 700);
        } else if (this.numberOfFeaturedNews == 3) {
            setTimeout(() => {
                this.canNavigateRight = true;
                this.canNavigateLeft = true;
            }, 700);
        } else {
            setTimeout(() => {
                this.canNavigateRight = true;
                this.canNavigateLeft = false;
            }, 700);
        }
    }

    switchWithRightArrow() {
        this.disableNavigation();
        let middleIndex = null;
        let lastIndex = null;
        let firstIndex = null;
        let lastInvisibleIndex = null;
        let firstInvisibleIndex = null;
        let invisibleItemsCopy = structuredClone(this.invisibleItems);
        let tmp1 = null;
        let tmp2 = invisibleItemsCopy[0];
        let tmp3 = null;
        let oldFirstIndex = null;
        if (this.numberOfFeaturedNews <= 3) {
            for (var i = 0; i < this.featuredNews.length; i++) {
                if (this.featuredNews[i]["position"] == "featured-news-entry-first-invisible") {
                    oldFirstIndex = i;
                    break;
                }
            }
        }
        for (var i = 0; i < this.featuredNews.length; i++) {
            let news = this.featuredNews[i];
            switch (news["position"]) {
                case "featured-news-entry-middle":
                    news["position"] = "featured-news-entry-middle featured-news-entry-slideleft";
                    firstIndex = i;
                    setTimeout(() => {
                        news["position"] = "featured-news-entry-first";
                        if (this.numberOfFeaturedNews <= 3) {
                            this.featuredNews[oldFirstIndex] = structuredClone(news);
                            this.featuredNews[oldFirstIndex]["position"] = "featured-news-entry-last-invisible";
                        }
                    }, 700);
                    break;
                case "featured-news-entry-last":
                    news["position"] = "featured-news-entry-last featured-news-entry-slideleft";
                    middleIndex = i;
                    setTimeout(() => {
                        news["position"] = "featured-news-entry-middle";
                    }, 700);
                    break;
                case "featured-news-entry-first":
                    news["position"] = "featured-news-entry-first-fadeaway";
                    firstInvisibleIndex = i;
                    tmp1 = i;
                    setTimeout(() => {
                        news["position"] = "featured-news-entry-first-invisible";
                        if (this.numberOfFeaturedNews > 3) {
                            invisibleItemsCopy.push(tmp1);
                        }
                    }, 700);
                    break;
                case "featured-news-entry-last-invisible":
                    news["position"] = "featured-news-entry-last-fadein";
                    lastIndex = i;
                    setTimeout(() => {
                        news["position"] = "featured-news-entry-last";
                        if (this.numberOfFeaturedNews > 3) {
                            invisibleItemsCopy.shift();
                        }
                    }, 700);
                    break;
                case "featured-news-entry-first-invisible":
                    tmp2 = i;
                    break;
                case "hidden":
                    if (i == invisibleItemsCopy[0]) {
                        tmp3 = i;
                    }
                    break;
            }
        }
        if (this.numberOfFeaturedNews > 3) {
            setTimeout(() => {
                this.featuredNews[tmp2] = structuredClone(this.featuredNews[invisibleItemsCopy[invisibleItemsCopy.length - 1]]);
                this.featuredNews[tmp2]["position"] = "hidden";
                this.featuredNews[tmp3] = structuredClone(this.featuredNews[invisibleItemsCopy[0]]);
                this.featuredNews[tmp3]["position"] = "featured-news-entry-last-invisible";
                lastInvisibleIndex = tmp3;
                let tmp = [this.featuredNews[middleIndex], this.featuredNews[lastIndex]];
                for (var i = 0; i < invisibleItemsCopy.length - 1; i++) {
                    tmp.push(this.featuredNews[invisibleItemsCopy[i]]);
                }
                tmp.push(this.featuredNews[tmp2]);
                tmp.push(this.featuredNews[firstIndex], this.featuredNews[lastInvisibleIndex], this.featuredNews[firstInvisibleIndex]);
                this.featuredNews = tmp;
                this.canNavigateLeft = true;
                this.canNavigateRight = true;
            }, 700);
        } else if (this.numberOfFeaturedNews == 3) {
            setTimeout(() => {
                this.canNavigateLeft = true;
                this.canNavigateRight = true;
            }, 700);
        } else {
            setTimeout(() => {
                this.canNavigateLeft = true;
                this.canNavigateRight = false;
            }, 700);
        }
    }

    disableNavigation() {
        this.canNavigateLeft = false;
        this.canNavigateRight = false;
        this.changeDetectorRef.detectChanges();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth <= 992 && this.featuredNewsElement) {
            let middleElements = document.getElementsByClassName("featured-news-entry");
            let maxHeight = 0;
            for (var i = 0; i < middleElements.length; i++) {
                if (middleElements[i]["offsetHeight"] > maxHeight) {
                    maxHeight = middleElements[i]["offsetHeight"];
                }
            }
            this.featuredNewsElement.nativeElement.style.height = maxHeight + "px";
        } else if (this.featuredNewsElement) {
            this.featuredNewsElement.nativeElement.style.height = "600px";
        }
    }

    onOpenNews(newsId: number, title: String) {
        this.router.navigate(['/site/news', title], {
            queryParams: {
                id: newsId
            }
        });
    }

    ngOnDestroy(): void {
        if (!this.isAdmin) {
            this.popupModalService.unsetModal(this.subscribePopupName);
            this.popupModalService.unsetModal(this.unsubscribePopupName);
        }
    }

}
