import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
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
            catchError((error: any) => {
                let errorMessage = error.error;
                if (error.status == 401) {
                    if (errorMessage == "You are not logged in" || errorMessage == "Insufficient permissions" || errorMessage == "Invalid access token") {
                        this.router.navigate(['/site']);
                    } else if (errorMessage == "Expired access cookie" || errorMessage == "Expired access token") {
                        return this.refreshAccessToken(req, next);
                    }
                } else if (error.status == 500) {
                    if (errorMessage == "Could not log out") {
                        this.router.navigate(['/site']);
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
                this.router.navigate(['/site']);
                throw error;
            })
        );
    }

}
