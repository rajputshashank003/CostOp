import { paymentApi } from './api_request/payment';
import toast from 'react-hot-toast';

export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if ((window as any).Razorpay) {
            return resolve(true);
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

interface CheckoutProps {
    userEmail?: string;
    userName?: string;
    interval?: 'monthly' | 'annual' | 'yearly';
    onSuccess?: () => void;
    onError?: (err: any) => void;
}

export const startRazorpayCheckout = async ({
    onError,
}: CheckoutProps): Promise<void> => {
    toast("This feature is currently under maintenance. Please try again later.", {
        icon: "🔧",
        duration: 4000,
        style: {
            borderRadius: '16px',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            fontSize: '13px',
            fontWeight: '600',
            padding: '12px 16px',
        },
    });
    onError?.(new Error("Feature under maintenance"));
};
