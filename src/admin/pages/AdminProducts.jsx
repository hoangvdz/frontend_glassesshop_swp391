import { useCallback, useMemo, useState, memo, useEffect } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiCheck,
  FiFilter,
  FiChevronUp,
  FiChevronDown,
  FiMinus,
} from "react-icons/fi";
import AddProductModal from "../modal/AddProductModal";
import EditProductModal from "../modal/EditProductModal";
import { motion, AnimatePresence } from "framer-motion";

// API
import { deleteProduct } from "../services/productService";
import { getAllProducts } from "../services/productService";

/* ─────────────────────────────────────────
   Memoised row — only re-renders when its
   own data / selected state changes.
───────────────────────────────────────── */
const ProductRow = memo(
  ({ product, isSelected, onSelect, onEdit, onDelete }) => {
    const renderStock = (stock) => {
      if (stock === 0)
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">
            Hết hàng
          </span>
        );
      if (stock <= 10)
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            Sắp hết ({stock})
          </span>
        );
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
          Còn hàng ({stock})
        </span>
      );
    };

    return (
      <tr className={isSelected ? "bg-blue-50/40" : "hover:bg-gray-50/60"}>
        {/* Checkbox */}
        <td className="px-4 py-4">
          <div className="flex justify-center">
            <div
              onClick={() => onSelect(product.id)}
              className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center cursor-pointer
              ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 hover:border-blue-400"}`}
            >
              {isSelected && (
                <FiCheck size={10} strokeWidth={3} className="text-white" />
              )}
            </div>
          </div>
        </td>

        {/* Product */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={product.img}
              className="w-10 h-10 rounded-xl border border-gray-100 object-cover shadow-sm flex-shrink-0"
              alt={product.name}
              loading="lazy"
            />
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate leading-tight">
                {product.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">#{product.id}</p>
            </div>
          </div>
        </td>

        {/* Category */}
        <td className="px-6 py-4">
          <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
            {product?.category || product?.type || "N/A"}
          </span>
        </td>

        {/* Price */}
        <td className="px-6 py-4 text-right font-semibold text-gray-800">
          {product.price.toLocaleString("vi-VN")} ₫
        </td>

        {/* Stock */}
        <td className="px-6 py-4 text-center">{renderStock(product.stock)}</td>

        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex justify-end gap-1">
            <div className="relative group">
              <button
                onClick={() => onEdit(product)}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
              >
                <FiEdit2 size={15} />
              </button>
              <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-md bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                Chỉnh sửa
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={() => onDelete(product.id)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50"
              >
                <FiTrash2 size={15} />
              </button>
              <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-md bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                Xoá
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  },
);
ProductRow.displayName = "ProductRow";

/* ─────────────────────────────────────────
   Sort icon — stable component outside
   parent so it doesn't remount each render
───────────────────────────────────────── */
const SortIcon = memo(({ sortOrder }) => {
  if (sortOrder === "asc")
    return <FiChevronUp size={13} className="text-blue-600" />;
  if (sortOrder === "desc")
    return <FiChevronDown size={13} className="text-blue-600" />;
  return (
    <span className="flex flex-col opacity-30">
      <FiChevronUp size={10} />
      <FiChevronDown size={10} />
    </span>
  );
});
SortIcon.displayName = "SortIcon";

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
function AdminProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();

        setProducts(data.filter(Boolean));
      } catch (error) {
        console.error("Error Api Get All Product: ", error);
      }
    };

    fetchProducts();
  }, []);


  
  /* ── categories ── */
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p?.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  /* ── filter + sort ── */
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (!p) return false;

      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "all" || p.category === category;
      let matchPrice = true;
      switch (priceFilter) {
        case "under500":
          matchPrice = p.price < 500000;
          break;
        case "500to1m":
          matchPrice = p.price >= 500000 && p.price <= 1000000;
          break;
        case "1mto2m":
          matchPrice = p.price > 1000000 && p.price <= 2000000;
          break;
        case "over2m":
          matchPrice = p.price > 2000000;
          break;
        default:
          matchPrice = true;
      }
      return matchName && matchCategory && matchPrice;
    });
    if (sortOrder === "asc")
      result = [...result].sort((a, b) => a.price - b.price);
    if (sortOrder === "desc")
      result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, search, category, priceFilter, sortOrder]);

  /* ── pagination ── */
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  /* ── select ── */
  const pageIds = useMemo(
    () => paginatedProducts.map((p) => p.id),
    [paginatedProducts],
  );
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedSet.has(id));
  const somePageSelected =
    pageIds.some((id) => selectedSet.has(id)) && !allPageSelected;

  const toggleSelect = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allPageSelected) {
      setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...pageIds])]);
    }
  }, [allPageSelected, pageIds]);

  /* ── delete ── */
  const handleDelete = useCallback(async () => {
    try {
      if (confirmDelete === "bulk") {
        // gọi API từng cái
        await Promise.all(selected.map((id) => deleteProduct(id)));

        setProducts((prev) => prev.filter((p) => !selectedSet.has(p.id)));
        setSelected([]);
      } else {
        await deleteProduct(confirmDelete);

        setProducts((prev) =>
          prev.filter((p) => String(p.id) !== String(confirmDelete)),
        );
        setSelected((prev) =>
          prev.filter((id) => String(id) !== String(confirmDelete)),
        );
      }
    } catch (err) {
      console.error("Delete error: ", err);
      const message = err.response?.data?.message || "Xoá thất bại!";

      alert(message);
    }

    setConfirmDelete(null);
  }, [confirmDelete, selected, selectedSet]);

  const handleAddProduct = useCallback(
    (p) => setProducts((prev) => [...prev, p]),
    [],
  );
  const handleUpdateProduct = useCallback(
    (p) => setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x))),
    [],
  );

  const openDelete = useCallback((id) => setConfirmDelete(id), []);
  const openEdit = useCallback((product) => setEditingProduct(product), []);

  /* ── smart pagination ── */
  const getPagination = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (safeCurrentPage > 4) pages.push("...");
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safeCurrentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const activeFilters = [
    category !== "all",
    priceFilter !== "all",
    search !== "",
  ].filter(Boolean).length;
  const isEmpty = products.length === 0;
  const isFilteredEmpty = filteredProducts.length === 0;

  return (
    <div className="px-8 pt-6 pb-12 bg-gray-50 min-h-full overflow-x-hidden">
      {/* ── HEADER ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredProducts.length} / {products.length} sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => setConfirmDelete("bulk")}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm"
              >
                <FiTrash2 size={14} />
                Xoá ({selected.length})
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm"
          >
            <FiPlus size={15} />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {/* ── TOOLBAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-100">
          <div className="relative w-72">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-400">
              <FiFilter size={13} />
              {activeFilters > 0 && (
                <span className="bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {activeFilters}
                </span>
              )}
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 text-gray-700"
            >
              {categories.filter(Boolean).map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Tất cả danh mục" : c}
                </option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(e) => {
                setPriceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 text-gray-700"
            >
              <option value="all">Tất cả mức giá</option>
              <option value="under500">Dưới 500k</option>
              <option value="500to1m">500k – 1 triệu</option>
              <option value="1mto2m">1 – 2 triệu</option>
              <option value="over2m">Trên 2 triệu</option>
            </select>

            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setPriceFilter("all");
                  setCurrentPage(1);
                }}
                className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50"
              >
                Xoá bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 bg-gray-50/60">
                <th className="w-[5%] px-4 py-3.5 text-center">
                  <div
                    onClick={toggleSelectAll}
                    className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center cursor-pointer mx-auto
                      ${allPageSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 hover:border-blue-400"}`}
                  >
                    {allPageSelected && (
                      <FiCheck
                        size={10}
                        strokeWidth={3}
                        className="text-white"
                      />
                    )}
                    {somePageSelected && !allPageSelected && (
                      <FiMinus
                        size={10}
                        strokeWidth={3}
                        className="text-blue-500"
                      />
                    )}
                  </div>
                </th>
                <th className="w-[32%] text-left px-6 py-3.5 font-semibold tracking-wider">
                  Sản phẩm
                </th>
                <th className="w-[18%] text-left px-6 py-3.5 font-semibold tracking-wider">
                  Danh mục
                </th>
                <th className="w-[16%] text-right px-6 py-3.5 font-semibold tracking-wider">
                  <span
                    onClick={() =>
                      setSortOrder((p) =>
                        p === "asc" ? "desc" : p === "desc" ? "default" : "asc",
                      )
                    }
                    className="cursor-pointer select-none hover:text-gray-700 normal-case inline-flex items-center justify-end gap-1"
                  >
                    Giá <SortIcon sortOrder={sortOrder} />
                  </span>
                </th>
                <th className="w-[16%] text-center px-6 py-3.5 font-semibold tracking-wider">
                  Tồn kho
                </th>
                <th className="w-[13%] text-right px-6 py-3.5 font-semibold tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {isFilteredEmpty && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FiPackage
                        size={40}
                        strokeWidth={1.2}
                        className="text-gray-200"
                      />
                      <p className="text-sm text-gray-400">
                        {isEmpty
                          ? "Chưa có sản phẩm nào"
                          : "Không tìm thấy sản phẩm phù hợp"}
                      </p>
                      {!isEmpty && (
                        <button
                          onClick={() => {
                            setSearch("");
                            setCategory("all");
                            setPriceFilter("all");
                          }}
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Xoá bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {!isFilteredEmpty &&
                paginatedProducts
                  .filter(Boolean)
                  .map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      isSelected={selectedSet.has(product.id)}
                      onSelect={toggleSelect}
                      onEdit={openEdit}
                      onDelete={openDelete}
                    />
                  ))}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER ── */}
        {!isFilteredEmpty && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Hiển thị{" "}
              <span className="font-medium text-gray-600">
                {(safeCurrentPage - 1) * itemsPerPage + 1}–
                {Math.min(
                  safeCurrentPage * itemsPerPage,
                  filteredProducts.length,
                )}
              </span>{" "}
              trong{" "}
              <span className="font-medium text-gray-600">
                {filteredProducts.length}
              </span>{" "}
              sản phẩm
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 select-none">
                <button
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  ←
                </button>

                {getPagination().map((page, index) =>
                  page === "..." ? (
                    <span key={index} className="px-2 text-gray-300 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[34px] px-3 py-1.5 rounded-lg text-sm font-medium
                        ${safeCurrentPage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CONFIRM DELETE MODAL ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white rounded-2xl p-6 w-96 shadow-xl"
            >
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <FiTrash2 size={18} className="text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                Xác nhận xoá
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {confirmDelete === "bulk"
                  ? `Bạn sắp xoá ${selected.length} sản phẩm. Hành động này không thể hoàn tác.`
                  : "Bạn có chắc muốn xoá sản phẩm này? Hành động này không thể hoàn tác."}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 font-medium"
                >
                  Xoá
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddProduct}
        />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
        />
      )}
    </div>
  );
}

export default AdminProducts;
