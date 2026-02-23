import { useState } from "react";
import HeaderBar from "../components/prescription/Headerbar";
import FrameSummary from "../components/prescription/FrameSummary";
import PrescriptionTable from "../components/prescription/PrescriptionTable";
import PDSection from "../components/prescription/PDSection";
import ExtrasSection from "../components/prescription/ExtrasSection";
import SubmitBar from "../components/prescription/SubmitBar";

export default function PrescriptionPage() {
  const [form, setForm] = useState({
    right: { sph:"", cyl:"", axis:"", add:"" },
    left:  { sph:"", cyl:"", axis:"", add:"" },
    pd: "",
    twoPD: false,
    prism: false,
    savePrescription: false
  });

  const [errors, setErrors] = useState({});

  /* ---------- UPDATE HELPERS ---------- */

  const updateEye = (eye, field, value) => {
    setForm(prev => ({
      ...prev,
      [eye]: { ...prev[eye], [field]: value }
    }));
  };

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  /* ---------- VALIDATION ---------- */

  const validate = () => {
    const e = {};

    if (!form.right.sph) e.rightSph = "Required";
    if (!form.left.sph) e.leftSph = "Required";
    if (!form.pd) e.pd = "Required";

    if (form.right.cyl && !form.right.axis)
      e.rightAxis = "Axis required if CYL entered";

    if (form.left.cyl && !form.left.axis)
      e.leftAxis = "Axis required if CYL entered";

    return e;
  };

  const handleSubmit = () => {
    const v = validate();
    setErrors(v);

    if (Object.keys(v).length > 0) return;

    const payload = {
      prescription: form,
      frameId: "FRAME123"
    };

    console.log("SUBMITTING", payload);
  };

  const isValid = Object.keys(validate()).length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <HeaderBar />

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 px-8 py-6 flex-1">

        <FrameSummary />

        <div>
          <h1 className="text-2xl font-semibold mb-6">
            Enter Your Prescription
          </h1>

          <PrescriptionTable
            form={form}
            errors={errors}
            updateEye={updateEye}
          />

          <PDSection
            form={form}
            errors={errors}
            updateField={updateField}
          />

          <ExtrasSection
            form={form}
            updateField={updateField}
          />
        </div>
      </div>

      <SubmitBar onSubmit={handleSubmit} disabled={!isValid}/>
    </div>
  );
}