import { HttpClient, HttpContext, HttpContextToken } from "@angular/common/http";
import { Injectable } from "@angular/core";

export const SKIP_INTERCEPT = new HttpContextToken(() => false);

@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(private http: HttpClient) { }

    validateAccessToken() {
        return this.http.get(
            'http://localhost:8080/api/user/current_user',
            {
                withCredentials: true
            }
        );
    }

    refreshAccessToken() {
        return this.http.post(
            'http://localhost:8080/api/user/refresh',
            null,
            {
                withCredentials: true,
                context: new HttpContext().set(SKIP_INTERCEPT, true)
            }
        );
    }

}
