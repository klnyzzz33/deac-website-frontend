function creditCardInit(image) {
    var cleave = new Cleave(".cardnumber-input", {
        creditCard: true,
        delimiter: '-',
        onCreditCardTypeChanged: function (type) {
            showCreditCardImage(image, type);
        }
    });
}

function showCreditCardImage(image, creditCardType) {
    var cardImageSrc = getCreditCardImageSrc(creditCardType);
    image.src = cardImageSrc;
}

function getCreditCardImageSrc(creditCardType) {
    switch (creditCardType) {
        case CreditCardType.MasterCard: return "assets/img/payment/credit-card-mastercard.svg";
        case CreditCardType.Visa: return "assets/img/payment/credit-card-visa.svg";
        case CreditCardType.JCB: return "assets/img/payment/credit-card-jcb.svg";
        case CreditCardType.AmericanExpress: return "assets/img/payment/credit-card-amex.svg";
        case CreditCardType.Discover: return "assets/img/payment/credit-card-discover.svg";
        case CreditCardType.Diners: return "assets/img/payment/credit-card-diners.svg";
        case CreditCardType.UnionPay: return "assets/img/payment/credit-card-unionpay.svg";
        default: return "assets/img/payment/credit-card.svg";
    }
}

function findType(cardNumber) {
    if (!cardNumber) return CreditCardType.Unknown;

    if (/^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}/.test(cardNumber)) {
        return CreditCardType.MasterCard;
    }

    if (/^4\d{0,15}/.test(cardNumber)) {
        return CreditCardType.Visa;
    }

    if (/^(?:35\d{0,2})\d{0,12}/.test(cardNumber)) {
        return CreditCardType.JCB;
    }

    if (/^3[47]\d{0,13}/.test(cardNumber)) {
        return CreditCardType.AmericanExpress;
    }

    if (/^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/.test(cardNumber)) {
        return CreditCardType.Discover;
    }

    if (/^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/.test(cardNumber)) {
        return CreditCardType.Diners;
    }

    if (/^(62|81)\d{0,14}/.test(cardNumber)) {
        return CreditCardType.UnionPay;
    }

    return CreditCardType.Unknown;
}

const CreditCardType = {
    MasterCard: "mastercard",
    Visa: "visa",
    JCB: "jcb",
    AmericanExpress: "amex",
    Discover: "discover",
    Diners: "diners",
    UnionPay: "unionPay",
    Unknown: "unknown"
}