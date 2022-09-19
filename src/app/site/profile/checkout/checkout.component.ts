import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

declare function creditCardInit(image: any): void;

declare function initializePayment(): void;

declare function makePayment(data: Object): Promise<Object>;

declare function orderComplete(clientSecret: string): Promise<Object>;

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements AfterViewInit {

    @ViewChild("cardnumber") cardNumber: ElementRef;

    @ViewChild("cardnumbericon") cardNumberIcon: ElementRef;

    @ViewChild("checkoutbutton") checkoutButton: ElementRef;

    @ViewChild("spinner") spinner: ElementRef;

    @ViewChild("checkoutbuttontext") checkoutButtonText: ElementRef;

    @ViewChild("carderrors") cardErrors: ElementRef;

    @ViewChild("cardname") cardName: ElementRef;

    errorMessage = null;

    clientSecret = "";

    expirationMonth: number;

    expirationYear: number;

    cvcNumber: number;

    numberRegex = new RegExp("^[0-9]*$");

    savedPaymentMethods: {
        id: string,
        last4: string,
        expMonth: number,
        expYear: number,
        brand: string
    }[] = [];

    constructor(private http: HttpClient, private changeDetectorRef: ChangeDetectorRef) { }

    ngAfterViewInit(): void {
        this.listPaymentMethods();
        initializePayment();
        //this.initializePayment();
    }

    listPaymentMethods() {
        this.http.post(
            'http://localhost:8080/api/payment/list',
            null,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: {
                    id: string,
                    last4: string,
                    expMonth: number,
                    expYear: number,
                    brand: string
                }[]) => {
                    this.savedPaymentMethods = responseData;
                },
                error: (error) => { this.errorMessage = "Could not list payment methods" },
                complete: () => { }
            });
    }

    initializePayment() {
        this.http.post(
            'http://localhost:8080/api/payment/initialize',
            null,
            {
                withCredentials: true
            }
        )
            .subscribe({
                next: (responseData: { message: string }) => {
                    this.clientSecret = responseData.message;
                    this.changeDetectorRef.detectChanges();
                    creditCardInit(this.cardNumberIcon.nativeElement);
                },
                error: (error) => { this.errorMessage = "Could not initialize payment" },
                complete: () => { }
            });
    }

    formatExpirationMonth(exp: any) {
        let upperBound = Math.min(exp.value.length, 2);
        exp.value = exp.value.slice(0, upperBound);
        let i = 0;
        while (i < exp.value.length) {
            var char = exp.value.charAt(i);
            if (!this.numberRegex.test(char)) {
                exp.value = exp.value.slice(0, i) + exp.value.slice(i + 1);
            } else {
                i++;
            }
        }
        if (exp.value.length == 1 && Number(exp.value) > 1) {
            exp.value = "0" + exp.value;
        } else if (exp.value.length == 2 && Number(exp.value) == 0) {
            exp.value = "01";
        } else if (Number(exp.value) > 12) {
            exp.value = "12";
        }
        this.expirationMonth = Number(exp.value);
        if (exp.value.length == 2) {
            exp.nextElementSibling.focus();
        }
    }

    formatExpirationYear(exp: any) {
        let upperBound = Math.min(exp.value.length, 2);
        exp.value = exp.value.slice(0, upperBound);
        let i = 0;
        while (i < exp.value.length) {
            var char = exp.value.charAt(i);
            if (!this.numberRegex.test(char)) {
                exp.value = exp.value.slice(0, i) + exp.value.slice(i + 1);
            } else {
                i++;
            }
        }
        this.expirationYear = 2000 + Number(exp.value);
    }

    switchBackFocusToExpirationMonth(event: any, exp: any) {
        if (event.key == "Backspace" && exp.value.length == 0) {
            exp.previousElementSibling.focus();
        }
    }

    formatCvcValue(cvc: any) {
        let upperBound = Math.min(cvc.value.length, 3);
        cvc.value = cvc.value.slice(0, upperBound);
        let i = 0;
        while (i < cvc.value.length) {
            var char = cvc.value.charAt(i);
            if (!this.numberRegex.test(char)) {
                cvc.value = cvc.value.slice(0, i) + cvc.value.slice(i + 1);
            } else {
                i++;
            }
        }
        this.cvcNumber = Number(cvc.value);
    }

    onSubmit() {
        let cardholderName = this.cardName.nativeElement.value;
        let data = {
            billing_details: {}
        };
        if (cardholderName) {
            data["billing_details"]["name"] = cardholderName;
        }
        this.changeLoadingState(true);
        makePayment(data).then(result => {
            if (!result["error"]) {
                this.http.post(
                    'http://localhost:8080/api/payment/confirm',
                    result,
                    {
                        responseType: 'json',
                        withCredentials: true
                    }
                )
                    .subscribe({
                        next: (responseData: {
                            clientSecret: string,
                            requiresAction: boolean
                        }) => {
                            console.log(responseData);
                            if (!responseData.requiresAction) {
                                this.changeLoadingState(false);
                                orderComplete(responseData.clientSecret).then(result => {
                                    console.log(result);
                                });
                            }
                        },
                        error: (error) => {
                            this.changeLoadingState(false);
                            this.showError(error.error);
                        },
                        complete: () => { }
                    });
            } else {
                this.changeLoadingState(false);
                this.showError(result["message"]);
            }
        });
        /*let publicKey = "pk_test_51Li3D7IDp80KjNuDc2HE5WqTyC0CS8mwTwQkm0nzcnGBhoYVpuAxnkeefZbaGdnuGrOKaeuDzh0cOjSbUGo4bRgP00YEbX7Jbz"
        let headers = new HttpHeaders({
            'Authorization': 'Bearer ' + publicKey
        });
        this.http.get(
            'https://api.stripe.com/v1/payment_intents/' + this.clientSecret,
            {
                responseType: 'json',
                headers: headers
            }
        )
            .subscribe({
                next: (responseData) => {
                    console.log(responseData);
                },
                error: (error) => { this.errorMessage = "Could not make payment" },
                complete: () => { }
            });
        /*let cardNumber = this.cardNumber.nativeElement.value;
        cardNumber = Number(cardNumber.split("-").join(""));
        let data = {
            payment_method_data: {
                billing_details: {
                    address: {
                        country: "HU"
                    }
                }
            },
            type: "card",
            card: {
                number: cardNumber,
                exp_month: this.expirationMonth,
                exp_year: this.expirationYear,
                cvc: this.cvcNumber
            },
            return_url: "http://localhost:4200/site/profile",
            client_secret: this.clientSecret,
            key: "pk_test_51Li3D7IDp80KjNuDc2HE5WqTyC0CS8mwTwQkm0nzcnGBhoYVpuAxnkeefZbaGdnuGrOKaeuDzh0cOjSbUGo4bRgP00YEbX7Jbz"
        }
        console.log(this.clientSecret);
        let headers = new HttpHeaders({
            'Authorization': 'Bearer ' + this.clientSecret
        });
        this.http.post(
            'https://api.stripe.com/v1/payment_intents/' + 'pi_3LjDo1IDp80KjNuD0RTLxcwV' + '/confirm',
            data,
            {
                responseType: 'json',
                headers: headers
            }
        )
            .subscribe({
                next: (responseData) => {
                    console.log(responseData);
                },
                error: (error) => { this.errorMessage = "Could not make payment" },
                complete: () => { }
            });*/
    }

    showError(errorMessage: string) {
        this.changeLoadingState(false);
        var error = this.cardErrors.nativeElement;
        error.textContent = errorMessage;
        error.style.display = "block";
        setTimeout(function () {
            error.textContent = "";
            error.style.display = "none";
        }, 5000);
    }

    changeLoadingState(isLoading: boolean) {
        if (isLoading) {
            this.checkoutButton.nativeElement.disabled = true;
            this.spinner.nativeElement.classList.remove("hidden");
            this.checkoutButtonText.nativeElement.classList.add("hidden");
        } else {
            this.checkoutButton.nativeElement.disabled = false;
            this.spinner.nativeElement.classList.add("hidden");
            this.checkoutButtonText.nativeElement.classList.remove("hidden");
        }
    }

}
