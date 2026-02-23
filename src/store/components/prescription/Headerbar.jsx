import { ArrowLeft, X, HelpCircle } from "lucide-react";

export default function HeaderBar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-white">

      <button className="flex items-center gap-2 text-sm">
        <ArrowLeft size={18}/>
        Back
      </button>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <HelpCircle size={16}/>
        Learn how to read your prescription
      </div>

      <button>
        <X size={20}/>
      </button>

    </div>
  );
}