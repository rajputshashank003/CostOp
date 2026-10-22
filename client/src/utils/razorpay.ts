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
    userEmail,
    userName,
    interval = 'monthly',
    onSuccess,
    onError,
}: CheckoutProps): Promise<void> => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
        toast.error('Failed to load Razorpay payment gateway. Please check your internet connection.');
        return;
    }

    try {
        const order = await paymentApi.create_order({ interval });

        const options = {
            key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Tr306sywUEBzzY',
            amount: order.amount,
            currency: order.currency || 'INR',
            name: 'CostOp',
            description: 'CostOp Pro Workspace Upgrade',
            image: '/favicon.ico',
            order_id: order.order_id,
            prefill: {
                name: userName || '',
                email: userEmail || '',
            },
            theme: {
                color: '#059669', // Emerald-600
            },
            handler: async (response: any) => {
                try {
                    const verifyRes = await paymentApi.verify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    toast.success(verifyRes.message || 'Payment verified! Welcome to CostOp Pro.');
                    if (onSuccess) onSuccess();
                } catch (verifyErr: any) {
                    toast.error(verifyErr?.response?.data?.error || 'Payment verification failed.');
                    if (onError) onError(verifyErr);
                }
            },
            modal: {
                ondismiss: () => {
                    toast('Checkout cancelled', { icon: 'ℹ️' });
                },
            },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.on('payment.failed', (response: any) => {
            toast.error(response?.error?.description || 'Payment failed. Please try again.');
            if (onError) onError(response?.error);
        });
        razorpayInstance.open();
    } catch (err: any) {
        console.error('Checkout error:', err);
        toast.error(err?.response?.data?.error || 'Failed to start payment checkout.');
        if (onError) onError(err);
    }
};
