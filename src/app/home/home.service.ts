import { ElementRef, Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class HomeService {

    elements: {
        button: ElementRef,
        spinner: ElementRef,
        buttonText: ElementRef
    } = null;

    onLoadingState = new Subject<{
        isLoading: boolean,
        elements: {
            button: ElementRef,
            spinner: ElementRef,
            buttonText: ElementRef
        }
    }>();

    constructor() { }

    setElements(elements: {
        button: ElementRef,
        spinner: ElementRef,
        buttonText: ElementRef
    }) {
        this.elements = elements;
    }

}