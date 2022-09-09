import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, switchMap } from "rxjs";
import { AuthService, SKIP_INTERCEPT } from "./auth.service";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

    constructor(private router: Router, private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.context.get(SKIP_INTERCEPT) === true) {
            return next.handle(req);
        }
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = error.error;
                if (error.status == 401) {
                    if (errorMessage == "You are not logged in" || errorMessage == "Invalid access token") {
                        localStorage.clear();
                        this.router.navigate(['']);
                    } else if (errorMessage == "Expired access cookie" || errorMessage == "Expired access token") {
                        return this.refreshAccessToken(req, next);
                    } else if (errorMessage == "Insufficient permissions") {
                        this.router.navigate(['/site']);
                    }
                } else if (error.status == 500) {
                    if (errorMessage == "Could not get authorities" || errorMessage == "Could not log out") {
                        localStorage.clear();
                        this.router.navigate(['']);
                    }
                }
                throw error;
            })
        );
    }

    refreshAccessToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.refreshAccessToken().pipe(
            switchMap((responseMessage: { message: String }) => {
                return next.handle(req);
            }),
            catchError((error) => {
                let errorMessage = error.error;
                if (error.status == 401) {
                    if (errorMessage = "You are not logged in" || errorMessage == "Expired refresh cookie" || errorMessage == "Expired refresh token" || errorMessage == "Invalid refresh token") {
                        localStorage.clear();
                        this.router.navigate(['']);
                    }
                } else if (error.status == 500) {
                    if (errorMessage == "Could not refresh token" || errorMessage == "Internal server error") {
                        localStorage.clear();
                        this.router.navigate(['']);
                    }
                }
                throw error;
            })
        );
    }

}
