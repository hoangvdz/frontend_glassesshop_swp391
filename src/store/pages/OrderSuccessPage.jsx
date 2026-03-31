import { Link } from 'react-router-dom';

function OrderSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Successful!</h2>
                <p className="text-gray-600 mb-6">
                    Thank you for shopping at Falcon Eyewear. Your order is being processed and will be delivered soon.
                </p>

                <div className="space-y-3">
                    <Link to="/" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all">
                        Continue Shopping
                    </Link>
                    <Link to="/order" className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50">
                        View Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderSuccessPage;