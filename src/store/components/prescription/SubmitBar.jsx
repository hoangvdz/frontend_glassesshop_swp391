export default function SubmitBar({ onSubmit, disabled }) {
  return (
    <div className="sticky bottom-0 bg-white border-t px-8 py-4 flex justify-end">
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="bg-indigo-600 text-white px-10 py-3 rounded-lg text-lg disabled:opacity-40"
      >
        Gửi
      </button>
    </div>
  );
}