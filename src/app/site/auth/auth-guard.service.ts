import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from "@angular/router";
import { catchError, Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.authService.validateAccessToken().pipe(
            map((responseMessage: { message: string }) => {
                this.authService.setAuthorities(JSON.parse(responseMessage.message));
                return true;
            }),
            catchError((error) => {
                return of(false);
            })
        );
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.canActivate(childRoute, state);
    }

}
