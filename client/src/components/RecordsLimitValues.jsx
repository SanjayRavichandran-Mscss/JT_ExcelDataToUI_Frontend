import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";

const API_BASE = "http://localhost:5000/api/sheet";

// Simple icon components (you can replace with react-icons or heroicons)
const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const RecordsLimitValues = () => {
  const [records, setRecords] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const initialFormData = {
    material_grade_id: "",
    c_min: "",    c_max: "",
    cr_min: "",   cr_max: "",
    ni_min: "",   ni_max: "",
    mo_min: "",   mo_max: "",
    mn_min: "",   mn_max: "",
    si_min: "",   si_max: "",
    s_min: "",    s_max: "",
    p_min: "",    p_max: "",
    cu_min: "",   cu_max: "",
    fe_min: "",   fe_max: "",
    co_min: "",   co_max: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [formTitle, setFormTitle] = useState("Add New Material Limit");

  const selectRef = useRef(null);

  useEffect(() => {
    fetchGrades();
    fetchLimits();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await axios.get(`${API_BASE}/material-grades`);
      setGrades(res.data.grades || []);
    } catch (err) {
      console.error("Failed to load material grades:", err);
    }
  };

  const fetchLimits = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/limits`);
      setRecords(res.data.limits || []);
    } catch (err) {
      console.error("Failed to load limits:", err);
      setError("Failed to load material limits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (isEdit = false, rec = null) => {
    if (isEdit && rec) {
      setFormData({
        material_grade_id: rec.material_grade_id || "",
        c_min: rec.c_min || "",    c_max: rec.c_max || "",
        cr_min: rec.cr_min || "",  cr_max: rec.cr_max || "",
        ni_min: rec.ni_min || "",  ni_max: rec.ni_max || "",
        mo_min: rec.mo_min || "",  mo_max: rec.mo_max || "",
        mn_min: rec.mn_min || "",  mn_max: rec.mn_max || "",
        si_min: rec.si_min || "",  si_max: rec.si_max || "",
        s_min: rec.s_min || "",    s_max: rec.s_max || "",
        p_min: rec.p_min || "",    p_max: rec.p_max || "",
        cu_min: rec.cu_min || "",  cu_max: rec.cu_max || "",
        fe_min: rec.fe_min || "",  fe_max: rec.fe_max || "",
        co_min: rec.co_min || "",  co_max: rec.co_max || "",
      });
      setEditingId(rec.id);
      setFormTitle(`Edit: ${rec.material_grade || "Unknown"}`);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
      setFormTitle("Add New Material Limit");
    }
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setFormData(initialFormData);
      setEditingId(null);
      setError(null);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.material_grade_id) {
      setError("Please select a Material Grade");
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/limits/${editingId}`, formData);
        alert("Material limit updated successfully!");
      } else {
        await axios.post(`${API_BASE}/limits`, formData);
        alert("Material limit created successfully!");
      }
      closeModal();
      fetchLimits();
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material limit?")) return;

    try {
      await axios.delete(`${API_BASE}/limits/${id}`);
      alert("Deleted successfully");
      fetchLimits();
    } catch (err) {
      alert("Failed to delete: " + (err.response?.data?.message || err.message));
    }
  };

  const options = grades.map((g) => ({
    value: g.id,
    label: g.material_grade,
  }));

  const selectedOption = options.find(
    (opt) => opt.value === formData.material_grade_id
  ) || null;

  const handleFocus = () => {
    if (selectRef.current) {
      const input = selectRef.current.querySelector("input");
      if (input) input.select();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Material Specification Limits
            </h1>
            <p className="mt-2 text-gray-600">
              Define minimum and maximum allowed values for chemical composition
            </p>
          </div>
          {/* <button
            onClick={() => openModal(false)}
            disabled={loading || submitting}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2 text-lg">+</span> Add New Limit
          </button> */}
        </div>

        {/* Table Card */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
          {loading ? (
            <div className="py-20 text-center text-gray-500 text-lg">Loading limits...</div>
          ) : records.length === 0 ? (
            <div className="py-20 text-center text-gray-600">
              <p className="text-xl font-medium">No material limits found</p>
              <p className="mt-2">Click "Add New Limit" to create your first entry</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-800 sticky left-0 bg-gray-100 z-10 min-w-[180px]">
                      Material Grade
                    </th>

                    {["C", "Cr", "Ni", "Mo", "Mn", "Si", "S", "P", "Cu", "Fe", "Co"].map((el) => (
                      <th
                        key={el}
                        colSpan={2}
                        className="px-3 py-5 text-center text-sm font-semibold text-gray-700 border-l border-gray-200"
                      >
                        {el}
                      </th>
                    ))}

                    <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700 sticky right-0 bg-gray-100 z-10 min-w-[140px]">
                      Actions
                    </th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 bg-gray-50 z-10"></th>
                    {Array(11).fill().map((_, i) => (
                      <React.Fragment key={i}>
                        <th className="px-3 py-3 text-xs font-medium text-gray-600 text-center border-l">Min</th>
                        <th className="px-3 py-3 text-xs font-medium text-gray-600 text-center">Max</th>
                      </React.Fragment>
                    ))}
                    <th className="sticky right-0 bg-gray-50 z-10"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white z-10 whitespace-nowrap">
                        {r.material_grade}
                      </td>

                      <td className="px-3 py-4 text-center text-sm border-l">{r.c_min  || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.c_max  || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.cr_min || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.cr_max || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.ni_min || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.ni_max || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.mo_min || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.mo_max || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.mn_min || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.mn_max || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.si_min || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.si_max || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.s_min  || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.s_max  || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.p_min  || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.p_max  || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.cu_min || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.cu_max || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.fe_min || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.fe_max || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm border-l">{r.co_min || "—"}</td>
                      <td className="px-3 py-4 text-center text-sm">{r.co_max || "—"}</td>

                      <td className="px-6 py-4 text-center sticky right-0 bg-white z-10 whitespace-nowrap">
                        <button
                          onClick={() => openModal(true, r)}
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                          title="Edit this limit"
                        >
                          <EditIcon />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(r.id)}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium transition px-3 py-1.5 rounded-lg hover:bg-red-50 ml-2"
                          title="Delete this limit"
                        >
                          <DeleteIcon />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formTitle}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Define acceptable range for each chemical element
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 text-3xl font-light p-2 rounded-full hover:bg-gray-100 transition"
              >
                ×
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-8 mt-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
              <div className="space-y-10">
                {/* Material Grade */}
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Material Grade <span className="text-red-500">*</span>
                  </label>
                  <Select
                    ref={selectRef}
                    options={options}
                    value={selectedOption}
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        material_grade_id: selected ? selected.value : "",
                      }))
                    }
                    placeholder="Search or select material grade..."
                    isSearchable
                    isClearable
                    isDisabled={submitting}
                    onFocus={handleFocus}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    noOptionsMessage={() => "No grades found"}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? "#6366f1" : "#d1d5db",
                        borderRadius: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        boxShadow: state.isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.15)" : "none",
                        backgroundColor: "white",
                        minHeight: "50px",
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: "0.75rem",
                        marginTop: 8,
                        boxShadow:
                          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
                        zIndex: 50,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#6366f1"
                          : state.isFocused
                          ? "#eef2ff"
                          : "white",
                        color: state.isSelected ? "white" : "#1f2937",
                      }),
                    }}
                  />
                </div>

                {/* Chemical Elements Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Chemical Composition Limits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[
                      { label: "Carbon (C)", min: "c_min", max: "c_max" },
                      { label: "Chromium (Cr)", min: "cr_min", max: "cr_max" },
                      { label: "Nickel (Ni)", min: "ni_min", max: "ni_max" },
                      { label: "Molybdenum (Mo)", min: "mo_min", max: "mo_max" },
                      { label: "Manganese (Mn)", min: "mn_min", max: "mn_max" },
                      { label: "Silicon (Si)", min: "si_min", max: "si_max" },
                      { label: "Sulphur (S)", min: "s_min", max: "s_max" },
                      { label: "Phosphorus (P)", min: "p_min", max: "p_max" },
                      { label: "Copper (Cu)", min: "cu_min", max: "cu_max" },
                      { label: "Iron (Fe)", min: "fe_min", max: "fe_max" },
                      { label: "Cobalt (Co)", min: "co_min", max: "co_max" },
                    ].map((el) => (
                      <div
                        key={el.min}
                        className="space-y-3 bg-gray-50/50 p-5 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all"
                      >
                        <div className="font-medium text-gray-700">{el.label}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1.5">Minimum</label>
                            <input
                              type="text"
                              name={el.min}
                              value={formData[el.min]}
                              onChange={handleChange}
                              placeholder="e.g. 0.08"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-60"
                              disabled={submitting}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1.5">Maximum</label>
                            <input
                              type="text"
                              name={el.max}
                              value={formData[el.max]}
                              onChange={handleChange}
                              placeholder="e.g. 0.25"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:opacity-60"
                              disabled={submitting}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-12 flex flex-col sm:flex-row justify-end gap-4 border-t border-gray-200 pt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-10 py-3 rounded-xl text-white font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
                    submitting
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : editingId ? (
                    "Update Limit"
                  ) : (
                    "Create Limit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsLimitValues;