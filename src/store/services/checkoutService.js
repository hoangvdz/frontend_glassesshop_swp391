import { checkoutOrderApi, createPaymentApi } from "../api/orderApi";

export const checkoutOrder = async (
  formData,
  shippingFee,
  items,
  paymentMethod = [],
) => {
  const hasPreOrder = items.some(item => item.isPreorder || item.isPreOrder);

  const payload = {
    fullName: formData.fullName,
    phone: formData.phone,
    address: `${formData.address}, ${formData.city || ""}`.trim(),
    note: formData.note || "",
    paymentMethod: paymentMethod,
    shippingFee: parseFloat(shippingFee) || 0,
    voucherDiscount: 0,
    idempotencyKey: String(Date.now()),
    isPreorder: hasPreOrder 
  };

  try {
    const response = await checkoutOrderApi(payload);
    if (response.data?.success) {
      return response.data.data; // trả về order
    } else {
      throw new Error(response.data?.message || "Đặt hàng thất bại");
    }
  } catch (error) {
      console.error("LOI CHECKOUT:", error.response?.data);
      const backendMessage = error.response?.data?.message || JSON.stringify(error.response?.data) || error.message;
      throw new Error(`Lỗi từ Backend: ${backendMessage}`);
  }
};


export const createVNPayPayment = async (amount, orderId) => {
  try {
    const res = await createPaymentApi(amount, orderId);

    console.log("VNPay response:", res);

    return res.data.paymentUrl;
  } catch (error) {
    console.error("Create payment error:", error);
    throw error;
  }
};
