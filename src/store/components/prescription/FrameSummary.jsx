export default function FrameSummary() {
  return (
    <div className="bg-white rounded-lg p-6 h-fit sticky top-6">

      <img
        src="/frames/sample.png"
        alt="Frame"
        className="w-full mb-6"
      />

      <p className="text-sm text-gray-500">Frame</p>
      <p className="font-medium">Braidsby</p>
      <p className="mb-4">Clear</p>

      <p className="text-sm text-gray-500">Prescription</p>
      <p className="mb-6">Progressive</p>

      <div className="flex justify-between font-semibold text-lg">
        <span>Subtotal</span>
        <span>$35.95</span>
      </div>

    </div>
  );
}