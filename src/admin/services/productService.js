import { createProductApi, deleteProductApi, getAllProductsApi } from "../api/productApi";


const mapProduct = (p) => {
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
};

export const getAllProducts = async () => {
  const res = await getAllProductsApi();

  return res.map(mapProduct);
};

export const createProduct = async (form) => {
  const payload = {
    productType: form.type, // FRAME / ACCESSORY
    name: form.name,
    brand: form.brand,
    description: form.description || "",
    price: Number(form.price),
    isPrescriptionSupported: true,

    variants: form.variants.map((v) => ({
      stockQuantity: Number(v.stock),
      frameSize: v.frameSize || null,
      color: v.color,
      material: v.material,
      imageUrl: v.image,
    })),
  };

  const res = await createProductApi(payload);

  return mapProduct(res);
};


export const deleteProduct = async (id) => {
  const res = await deleteProductApi(id);
  return res;
};
