import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, switchMap } from "rxjs";
import { AuthService, SKIP_INTERCEPT } from "./auth.service";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

    constructor(private router: Router, private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.context.get(SKIP_INTERCEPT) === true) {
            return next.handle(req);
        }
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = error.error;
                if (error.status == 401 && (errorMessage == "You are not logged in" || errorMessage == "Expired cookies" || errorMessage == "Invalid access token")) {
                    this.router.navigate(['']);
                } else if (error.status == 401 && (errorMessage == "Expired access cookie" || errorMessage == "Expired access token")) {
                    return this.refreshAccessToken(req, next);
                }
                throw error;
            })
        );
    }

    refreshAccessToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.authService.refreshAccessToken().pipe(
            switchMap((responseMessage: {message: string}) => {
                return next.handle(req);
            }),
            catchError((error) => {
                let errorMessage = error.error;
                if (error.status == 401 && (errorMessage == "You are not logged in" || errorMessage == "Expired cookies" || errorMessage == "Expired refresh cookie" || errorMessage == "Expired refresh token" || errorMessage == "Invalid refresh token")) {
                    this.router.navigate(['']);
                }
                throw error;
            })
        );
    }
    
}
