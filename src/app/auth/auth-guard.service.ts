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
                    if (error.status == 401 && (error.error.message == "You are not logged in" || error.error.message == "Expired cookie" || error.error.message == "Invalid token")) {
                        console.log(error.error.message);
                        this.router.navigate(['']);
                        return of(false);
                    } else if (error.status == 401 && error.error.message == "Expired token") {
                        console.log(error.error.message);
                        this.authService.setIsTokenExpired(true);
                        return of(true);
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
    
}
