export default function SubmitBar({ onSubmit, disabled }) {
  return (
    <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-8 py-5 flex justify-end items-center gap-6 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      <div className="hidden sm:block text-right">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Xác nhận thông tin</p>
        <p className="text-[11px] text-gray-500 italic max-w-xs leading-tight">Đảm bảo các thông số độ mắt đã khớp với đơn thuốc của bác sĩ.</p>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="relative group bg-stone-900 text-white px-10 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed hover:bg-indigo-600 shadow-xl shadow-stone-900/10 hover:shadow-indigo-500/20 overflow-hidden"
      >
        <span className="relative z-10">Cập nhật vào giỏ hàng</span>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}