import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { catchError, Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.getUser()
            .pipe(map((responseMessage: {message: string}) => {
                    return true;
                }),
                catchError((error) => {
                    let errorMessage = error.error.message;
                    if (error.status == 401 && (errorMessage == "You are not logged in" || errorMessage == "Expired cookies" || errorMessage == "Expired refresh cookie" || errorMessage == "Invalid access token" || errorMessage == "Invalid refresh token")) {
                        console.log(errorMessage);
                        this.router.navigate(['']);
                        return of(false);
                    } else if (error.status == 401 && (errorMessage == "Expired access cookie" || errorMessage == "Expired access token")) {
                        return this.refreshAccessToken();
                    }
                    return of(true);
                })
            );
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.canActivate(childRoute, state);
    }

    getUser() {
        return this.http.get(
          'http://localhost:8080/api/user/current_user',
          {
            withCredentials: true
          }
        );
    }

    refreshAccessToken(): Observable<boolean> {
        let type = "access-token";
        return this.http.post(
            'http://localhost:8080/api/user/refresh',
            type,
            {
              withCredentials: true
            }
        )
        .pipe(map((responseMessage: {message: string}) => {
                return true;
            }),
            catchError((error) => {
                let errorMessage = error.error.message;
                if (error.status == 401 && (errorMessage == "You are not logged in" || errorMessage == "Expired cookies" || errorMessage == "Expired refresh cookie" || errorMessage == "Invalid refresh token")) {
                    console.log(errorMessage);
                    this.router.navigate(['']);
                    return of(false);
                } else if (error.status == 401 && errorMessage == "Expired refresh token") {
                    console.log(errorMessage);
                    this.authService.setIsTokenExpired(true);
                    return of(true);
                }
                return of(true);
            })
        );
    }
    
}
