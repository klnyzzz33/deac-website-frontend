import { HttpClient, HttpContext, HttpContextToken } from "@angular/common/http";
import { Injectable } from "@angular/core";

export const SKIP_INTERCEPT = new HttpContextToken(() => false);

@Injectable()
export class AuthService {

    private authorities = [];

    private isAdmin = false;

    private isClient = false;

    constructor(private http: HttpClient) { }

    setAuthorities(authorities: string[]) {
        this.authorities = authorities;
        this.isAdmin = false;
        this.isClient = false;
        for (var i = 0; i < this.authorities.length; i++) {
            if (this.authorities[i]["authority"] == "ADMIN") {
                this.isAdmin = true;
                break;
            } else if (this.authorities[i]["authority"] == "CLIENT") {
                this.isClient = true;
                break;
            }
        }
    }

    hasAdminPrivileges() {
        return this.isAdmin;
    }

    hasClientPrivileges() {
        return this.isClient;
    }

    validateAccessTokenAndGetAuthorities() {
        return this.http.get(
            'http://localhost:8080/api/user/current_user_authorities',
            {
                withCredentials: true,
                context: new HttpContext().set(SKIP_INTERCEPT, true)
            }
        );
    }

    refreshAccessToken() {
        return this.http.post(
            'http://localhost:8080/api/user/auth/refresh',
            null,
            {
                withCredentials: true,
                context: new HttpContext().set(SKIP_INTERCEPT, true)
            }
        );
    }

}
