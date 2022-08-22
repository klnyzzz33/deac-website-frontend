import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { catchError, Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private router: Router, private authService: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.authService.validateAccessToken().pipe(
            map((responseMessage: {message: string}) => {
                return true;
            }),
            catchError((error) => {
                let errorMessage = error.error;
                if (error.status == 401 && (errorMessage == "You are not logged in" || errorMessage == "Expired cookies" || errorMessage == "Expired refresh cookie" || errorMessage == "Expired refresh token" || errorMessage == "Invalid refresh token")) {
                    return of(false);
                }
                return of(true);
            })
        );
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.canActivate(childRoute, state);
    }

}
