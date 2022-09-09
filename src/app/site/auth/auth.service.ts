import { HttpClient, HttpContext, HttpContextToken } from "@angular/common/http";
import { Injectable } from "@angular/core";

export const SKIP_INTERCEPT = new HttpContextToken(() => false);

@Injectable()
export class AuthService {

    private authorities = [];

    private isAdmin = false;

    constructor(private http: HttpClient) { }

    setAuthorities(authorities: string[]) {
        this.authorities = authorities;
        for (var i = 0; i < this.authorities.length; i++) {
            if (this.authorities[i]["authority"] == 'ADMIN') {
                this.isAdmin = true;
                break;
            }
        }
    }

    hasAdminPrivileges() {
        return this.isAdmin;
    }

    validateAccessToken() {
        return this.http.get(
            'http://localhost:8080/api/user/current_user_authorities',
            {
                withCredentials: true
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
