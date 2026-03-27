import { Link, useSearchParams } from 'react-router-dom';

function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    
    // Đọc mã "00" (Thành công) hoặc khác "00" (Thất bại) từ chính URL
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode'); 
    const vnp_TransactionNo = searchParams.get('vnp_TransactionNo');
    
    const isSuccess = vnp_ResponseCode === '00';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
                {isSuccess ? (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán VNPay thành công!</h2>
                        <p className="text-gray-600 mb-6">Mã giao dịch: {vnp_TransactionNo}</p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thất bại!</h2>
                        <p className="text-gray-600 mb-6">Bạn đã hủy giao dịch hoặc có lỗi xảy ra (Mã lỗi: {vnp_ResponseCode})</p>
                    </>
                )}
                {/* ... Các nút bấm "Xem đơn hàng" / "Về trang chủ" ... */}
            </div>
        </div>
    );
}

export default PaymentResultPage;