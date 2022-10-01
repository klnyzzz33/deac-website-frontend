import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { catchError, Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private router: Router, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.authService.validateAccessTokenAndGetAuthorities().pipe(
            map((responseMessage: { message: string }) => {
                return this.setAuthorities(responseMessage.message, state.url);
            }),
            catchError((error) => {
                return this.refreshAccessToken(route, state);
            })
        );
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.canActivate(childRoute, state);
    }

    refreshAccessToken(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.refreshAccessToken().pipe(
            map((responseMessage: { message: string }) => {
                return this.setAuthorities(responseMessage.message, state.url);
            }),
            catchError((error) => {
                if (state.url.startsWith("/site/dashboard") || state.url.startsWith("/site/news") || state.url.startsWith("/site/support") || state.url.startsWith("/site/about")) {
                    this.authService.setAuthorities([]);
                    return of(true);
                }
                this.router.navigate(['/site']);
                return of(false);
            })
        );
    }

    setAuthorities(message: string, url: string) {
        this.authService.setAuthorities(JSON.parse(message));
        if (url.startsWith("/site/admin") && !this.authService.hasAdminPrivileges()) {
            this.router.navigate(['/site']);
            return false;
        }
        return true;
    }

}
