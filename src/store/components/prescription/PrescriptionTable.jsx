export default function PrescriptionTable({ form, errors, updateEye }) {
  return (
    <table className="w-full border rounded-lg mb-6 text-sm">

      <thead className="bg-gray-100">
        <tr>
          <th></th>
          <th>SPH</th>
          <th>CYL</th>
          <th>AXIS</th>
          <th>ADD</th>
        </tr>
      </thead>

      <tbody>
        <EyeRow label="OD (Phải)" eye="right" {...{form,errors,updateEye}} />
        <EyeRow label="OS (Trái)"  eye="left"  {...{form,errors,updateEye}} />
      </tbody>

    </table>
  );
}

function EyeRow({ label, eye, form, errors, updateEye }) {
  const data = form[eye];

  return (
    <tr className="border-t">
      <td className="px-3 py-4 bg-gray-50">{label}</td>

      <Cell value={data.sph} onChange={v=>updateEye(eye,"sph",v)} error={errors[eye+"Sph"]}/>
      <Cell value={data.cyl} onChange={v=>updateEye(eye,"cyl",v)} />
      <Cell value={data.axis} onChange={v=>updateEye(eye,"axis",v)} error={errors[eye+"Axis"]}/>
      <Cell value={data.add} onChange={v=>updateEye(eye,"add",v)} />
    </tr>
  );
}

function Cell({ value, onChange, error }) {
  return (
    <td className="px-2 py-2">
      <select
        value={value}
        onChange={e=>onChange(e.target.value)}
        className={`w-full border rounded px-2 py-1 ${error?"border-red-500":""}`}
      >
        <option value="">--</option>
        <option>0.00</option>
        <option>-0.25</option>
        <option>-0.50</option>
        <option>-1.00</option>
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </td>
  );
}