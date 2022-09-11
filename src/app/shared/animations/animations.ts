import { animate, animateChild, query, stagger, state, style, transition, trigger } from "@angular/animations"

export const myAnimations = {
    appear: trigger("appear", [
        transition(':enter', [
            style({
                opacity: 0,
            }),
            animate('1s ease-in',
                style({
                    opacity: 1,
                })
            )
        ])
    ]),
    toggleOnOff: trigger("toggleOnOff", [
        transition(':enter', [
            style({
                opacity: 0,
            }),
            animate('1s ease-in',
                style({
                    opacity: 1,
                })
            )
        ]),
        transition(':leave', [
            style({
                opacity: 1,
            }),
            animate('1s ease-in',
                style({
                    opacity: 0,
                })
            )
        ])
    ]),
    slideIn: trigger("slideIn", [
        transition(':enter', [
            style({
                opacity: 0,
                transform: 'translateX(-100%)'
            }),
            animate('0.5s ease-out',
                style({
                    opacity: 1,
                    transform: 'translateX(0)'
                })
            )
        ])
    ]),
    slideInList: trigger("slideInList", [
        transition('* => *', [
            query(':enter',
                stagger('0.1s', [
                    animateChild()
                ]), { optional: true }
            )
        ])
    ]),
    slideInOutReverse: trigger("slideInOutReverse", [
        transition(':enter', [
            style({
                opacity: 0,
                transform: 'translateX(-200%)'
            }),
            animate('0.5s ease-out',
                style({
                    opacity: 1,
                    transform: 'translateX(0)'
                })
            )
        ]),
        transition(':leave', [
            style({
                opacity: 1,
                transform: 'translateX(0)'
            }),
            animate('0.5s ease-in',
                style({
                    opacity: 0,
                    transform: 'translateX(-200%)'
                })
            )
        ])
    ]),
    headerAppearDisappear: trigger("headerAppearDisappear", [
        state('visible', style({
            transform: 'translateY(0)',
        })),
        state('invisible', style({
            transform: 'translateY(-100%)',
        })),
        transition('visible => invisible', [
            animate('1s ease-out')
        ]),
        transition('invisible => visible', [
            animate('1s ease-out')
        ])
    ])
};