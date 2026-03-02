import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, HelpCircle } from "lucide-react";

export default function HeaderBar() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-white">

      <button className="flex items-center gap-2 text-sm  hover:bg-gray-100 rounded-full transition" onClick={() => navigate("/")}>
        <ArrowLeft size={18}/>
        Quay lại
      </button>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <HelpCircle size={16}/>
        Tìm hiểu thêm về đơn thuốc điện tử
      </div>

      <button>
        <X size={20}/>
      </button>

    </div>
  );
}