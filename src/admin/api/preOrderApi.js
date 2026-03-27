import adminClient from "./adminClient";

export const getStockVariantByIdApi = async (variantId) => {
  return adminClient.post(`/admin/products/variants/getStock/${variantId}`);
};
