export default function ExtrasSection({ form, updateField }) {
  return (
    <div className="space-y-3 text-sm">

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.prism}
          onChange={e=>updateField("prism", e.target.checked)}
        />
        Add Prism
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.savePrescription}
          onChange={e=>updateField("savePrescription", e.target.checked)}
        />
        Save my prescription
      </label>

    </div>
  );
}