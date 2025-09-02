import { useMemo, useState } from "react";
import { useJournalStore } from "../../state/journalStore";

// strict DD/MM/YYYY check incl. real calendar dates (leap years etc.)
function parseDDMMYYYY(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str?.trim() || "");
  if (!m) return null;
  const d = +m[1],
    mo = +m[2] - 1,
    y = +m[3];
  const dt = new Date(y, mo, d, 12, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d)
    return null;
  return dt;
}

export default function JournalForm() {
  const addEntry = useJournalStore((s) => s.addEntry);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    imgUrl: "",
    rating: "4.0",
    categories: "",
    date: "", // "DD/MM/YYYY"
    description: "",
  });

  const errors = useMemo(() => {
    const e = {};
    const r = Number(form.rating);
    if (Number.isNaN(r) || r < 0 || r > 5) e.rating = "Rating must be 0–5.";
    if (!parseDDMMYYYY(form.date))
      e.date = "Use DD/MM/YYYY (valid calendar date).";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!isValid) return;
    addEntry({
      imgUrl: form.imgUrl.trim(),
      rating: Number(form.rating),
      categories: form.categories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      date: form.date.trim(), // keep "DD/MM/YYYY"
      description: form.description.trim(),
    });
    setOpen(false);
    setForm({
      imgUrl: "",
      rating: "4.0",
      categories: "",
      date: "",
      description: "",
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-10 rounded-full bg-indigo-600 px-4 py-3 text-white shadow-lg"
        title="Add journal entry"
      >
        +
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 flex items-end sm:items-center justify-center p-3"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg space-y-3"
          >
            <div className="text-lg font-semibold">Add Entry</div>

            <label className="block text-sm">
              <span className="text-gray-600">Image URL (optional)</span>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={form.imgUrl}
                onChange={(e) => setForm({ ...form, imgUrl: e.target.value })}
              />
            </label>

            <label className="block text-sm">
              <span className="text-gray-600">Rating (0–5)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
              />
              {errors.rating && (
                <p className="mt-1 text-xs text-red-600">{errors.rating}</p>
              )}
            </label>

            <label className="block text-sm">
              <span className="text-gray-600">
                Categories (comma-separated)
              </span>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={form.categories}
                onChange={(e) =>
                  setForm({ ...form, categories: e.target.value })
                }
              />
            </label>

            <label className="block text-sm">
              <span className="text-gray-600">Date (DD/MM/YYYY)</span>
              <input
                placeholder="03/09/2025"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-600">{errors.date}</p>
              )}
            </label>

            <label className="block text-sm">
              <span className="text-gray-600">Description</span>
              <textarea
                rows="3"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className={`rounded-md px-3 py-2 text-sm text-white ${
                  isValid ? "bg-indigo-600" : "bg-indigo-300 cursor-not-allowed"
                }`}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
