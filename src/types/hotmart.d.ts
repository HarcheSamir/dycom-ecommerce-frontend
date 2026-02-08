declare global {
    interface Window {
        checkoutElements: {
            init: (type: 'inlineCheckout' | 'overlayCheckout', options: {
                offer: string;
                locale?: string;
                countryIsoCode?: string;
                prefilledInfo?: {
                    name?: string;
                    email?: string;
                    doc?: string;
                    zip?: string;
                    phoneac?: string;
                    phonenumber?: string;
                    sck?: string;
                };
                visibilityOptions?: {
                    hideBillet?: string;
                    hideTransf?: string;
                    hidePayPal?: string;
                    split?: string;
                    hideMultipleCards?: string;
                    showOnlyTrial?: string;
                    hideTrial?: string;
                    showTrialBillet?: string;
                    hidePix?: string;
                    hidewallet?: string;
                    hideCouponOption?: string;
                    xcod?: string;
                    src?: string;
                };
            }) => {
                mount: (selector: string) => void;
                attach: (selector: string) => void;
            };
        };
    }
}

export { };
