import { useEffect, type JSX } from 'react';

// Hotmart direct payment URL
const HOTMART_PAYMENT_URL = 'https://pay.hotmart.com/U103378139T';

/**
 * SignupPage - Redirects users directly to Hotmart payment page.
 * After payment, Hotmart webhook creates account and sends welcome email.
 */
const SignupPage = (): JSX.Element => {
    useEffect(() => {
        // Redirect to Hotmart payment page immediately
        window.location.href = HOTMART_PAYMENT_URL;
    }, []);

    // Show loading state while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            <div className="text-center">
                <img src="/logo2.png" alt="Dycom" className="h-12 mx-auto mb-6" />
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white">Redirection vers le paiement...</p>
            </div>
        </div>
    );
};

export default SignupPage;