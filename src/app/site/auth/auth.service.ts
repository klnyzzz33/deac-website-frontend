import { HttpClient, HttpContext, HttpContextToken } from "@angular/common/http";
import { Injectable } from "@angular/core";

export const SKIP_INTERCEPT = new HttpContextToken(() => false);

@Injectable()
export class AuthService {

    private authorities = [];

    private isAdmin = false;

    constructor(private http: HttpClient) {
        this.authorities = JSON.parse(localStorage.getItem("authorities"));
        this.isAdmin = this.authorities.includes("ADMIN");
    }

    setAuthorities(authorities: string[]) {
        this.authorities = authorities;
        this.isAdmin = this.authorities.includes("ADMIN");
    }

    hasAdminPrivileges() {
        return this.isAdmin;
    }

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
