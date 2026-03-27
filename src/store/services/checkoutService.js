import { checkoutOrderApi } from "../api/orderApi";

export const checkoutOrder = async (formData, shippingFee, items = []) => {
  const payload = {
    fullName: formData.fullName,
    phone: formData.phone,
    address: `${formData.address}, ${formData.city || ""}`.trim(),
    note: formData.note || "",
    paymentMethod: "COD",
    shippingFee: parseFloat(shippingFee) || 0,
    voucherDiscount: 0,
    idempotencyKey: String(Date.now()),
    items: items.map(item => ({
      productId: item.productId,
      variantId: item.variant?.variantId,
      quantity: item.quantity,
      // ĐẶC BIỆT QUAN TRỌNG: Gửi toa thuốc mắt
      isLens: item.isLens || false,
      sphLeft: item.sphLeft,
      sphRight: item.sphRight,
      cylLeft: item.cylLeft,
      cylRight: item.cylRight,
      axisLeft: item.axisLeft,
      axisRight: item.axisRight,
      addLeft: item.addLeft,
      addRight: item.addRight,
      pd: item.pd,
      itemType: item.isLens ? "PRESCRIPTION" : "IN_STOCK"
    }))
  };

  const response = await checkoutOrderApi(payload);

  if (response.data?.success) {
    return response.data.data; // trả về order
  } else {
    throw new Error(response.data?.message || "Đặt hàng thất bại");
  }
};