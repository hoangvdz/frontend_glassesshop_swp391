import { checkoutOrderApi } from "../api/orderApi";

export const checkoutOrder = async (formData, shippingFee) => {
  const payload = {
    fullName: formData.fullName,
    phone: formData.phone,
    address: `${formData.address}, ${formData.city || ""}`.trim(),
    note: formData.note || "",
    paymentMethod: "COD",
    shippingFee: parseFloat(shippingFee) || 0,
    voucherDiscount: 0,
    idempotencyKey: String(Date.now())
  };

  const response = await checkoutOrderApi(payload);

  if (response.data?.success) {
    return response.data.data; // trả về order
  } else {
    throw new Error(response.data?.message || "Đặt hàng thất bại");
  }
};