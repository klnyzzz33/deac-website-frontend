import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, switchMap, throwError } from "rxjs";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

    constructor(private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        /*return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status == 401 && (error.error == "Expired cookie" || error.error == "You are not logged in")) {
                    this.router.navigate(['']);
                }
                throw error;
            })
        );*/
        return next.handle(req);
    }
    
}