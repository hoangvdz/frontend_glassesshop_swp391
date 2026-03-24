import { getAllProductStoreApi } from "../api/productApi";

export const getAllProducts = async () => {
  const res = await getAllProductStoreApi();

  const mapped = res.map((p) => {
    const totalStock =
      p.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) ?? 0;

    return {
      id: p.productId,
      name: p.name,
      category: p.productType,
      price: p.price ?? 0,
      stock: totalStock,
      img:
        p.variants?.[0]?.imageUrl ||
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj1_Gp9JZ246p0IK04AFBLjWqfTwYWt-nD9w&s",
    };
  });

  return mapped;
};
