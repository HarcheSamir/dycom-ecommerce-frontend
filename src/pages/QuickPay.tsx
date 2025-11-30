import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { FaSpinner } from 'react-icons/fa';

export const QuickPay = () => {
    const { plan } = useParams<{ plan: string }>(); // Expecting '2x' or '3x'

    useEffect(() => {
        const initiateCheckout = async () => {
            try {
                // Extract number from '2x' -> '2'
                const installments = plan?.replace('x', '');
                
                if (installments !== '2' && installments !== '3') {
                    alert("Invalid plan link.");
                    window.location.href = '/';
                    return;
                }

                const response = await apiClient.post('/payment/guest-checkout', { 
                    installments 
                });

                if (response.data.url) {
                    window.location.href = response.data.url;
                }
            } catch (error) {
                console.error("Checkout failed", error);
                alert("Could not load payment page. Please contact support.");
            }
        };

        initiateCheckout();
    }, [plan]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
            <FaSpinner className="w-12 h-12 animate-spin text-purple-500 mb-4" />
            <h2 className="text-xl font-bold">Securing your payment...</h2>
            <p className="text-neutral-400 mt-2">Redirecting to Stripe Secure Checkout</p>
        </div>
    );
};