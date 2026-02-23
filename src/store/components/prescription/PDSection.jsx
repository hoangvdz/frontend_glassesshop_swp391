export default function PDSection({ form, errors, updateField }) {
  return (
    <div className="mb-6">

      <div className="flex gap-4 items-center">
        <select
          value={form.pd}
          onChange={e=>updateField("pd", e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Select PD</option>
          <option>60</option>
          <option>61</option>
          <option>62</option>
          <option>63</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.twoPD}
            onChange={e=>updateField("twoPD", e.target.checked)}
          />
          2 PD numbers
        </label>
      </div>

      {errors.pd && (
        <p className="text-sm text-red-500 mt-1">{errors.pd}</p>
      )}

    </div>
  );
}