import adminClient from "./adminClient";

export const getStockVariantByIdApi = async (variantId) => {
  return adminClient.post(`/admin/products/variants/getStock/${variantId}`);
};

export const updateStockApi = (variantId, quantity, body) => {
  return adminClient.put(
    `/admin/products/variants/updateStock/${variantId}?quantity=${quantity}`,
    body,
  );
};
