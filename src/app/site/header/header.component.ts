import { trigger, transition, style, animate, state } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { myAnimations } from 'src/app/shared/animations/animations';
import { AuthService } from '../auth/auth.service';

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

    constructor(private router: Router, private elem: ElementRef, private authService: AuthService) { }

    ngAfterViewInit(): void {
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
    }

    onSelectHeaderTab(id: string) {
        let elements = this.elem.nativeElement.querySelectorAll('.nav-item');
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
        }
        document.getElementById(id).parentElement.classList.add("active");
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

    ngOnDestroy(): void {
        this.urlChangeSubscription.unsubscribe();
    }

}
