import { useState } from "react";
import PropTypes from "prop-types";

const checklistOptions = [
  { value: "performance_based", label: "Performance-based specification" },
  { value: "open_standards", label: "References open standards" },
  { value: "multiple_brands", label: "Allows multiple brands" },
  { value: "esg_compliant", label: "Includes ESG/ethical criteria" },
];

const initialState = {
  technical_description: "",
  openness_checks: [],
  supplier_bias: false,
  market_notes: "",
};

function SpecificationAnalysisForm({ entries, onSubmit, saving }) {
  const [form, setForm] = useState(initialState);

  const toggleChecklist = (value) => {
    setForm((prev) => {
      const exists = prev.openness_checks.includes(value);
      return {
        ...prev,
        openness_checks: exists
          ? prev.openness_checks.filter((item) => item !== value)
          : [...prev.openness_checks, value],
      };
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (type === "checkbox" && name === "supplier_bias") {
      setForm((prev) => ({ ...prev, supplier_bias: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.technical_description) return;
    onSubmit(form)
      .then(() => setForm(initialState))
      .catch(() => {});
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Specification analysis</h2>
          <p className="muted">Validate suitability, openness, and potential bias in the technical specification.</p>
        </div>
        {form.supplier_bias && <span className="pill badge-non_compliant">Bias flagged</span>}
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="full-width">
          <span>Technical specification description*</span>
          <textarea name="technical_description" value={form.technical_description} onChange={handleChange} rows={3} required />
        </label>
        <fieldset className="full-width">
          <legend>Openness checklist</legend>
          <div className="checklist-grid">
            {checklistOptions.map((option) => (
              <label key={option.value} className="checkbox-chip">
                <input
                  type="checkbox"
                  checked={form.openness_checks.includes(option.value)}
                  onChange={() => toggleChecklist(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          <span>Supplier bias detected?</span>
          <input type="checkbox" name="supplier_bias" checked={form.supplier_bias} onChange={handleChange} />
        </label>
        <label className="full-width">
          <span>Market/comparison notes</span>
          <textarea name="market_notes" value={form.market_notes} onChange={handleChange} rows={2} placeholder="Comparison with market standards" />
        </label>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving..." : "Save analysis"}
        </button>
      </form>
      <div className="section">
        <div className="section-header">
          <h3>Specification records</h3>
          <p className="muted">{entries.length} entries</p>
        </div>
        {!entries.length && <p className="muted">No specification analyses yet.</p>}
        <ul className="requirement-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div>
                <strong>{entry.supplier_bias ? "Bias detected" : "Compliant"}</strong>
                <p>{entry.technical_description.slice(0, 200)}{entry.technical_description.length > 200 ? "..." : ""}</p>
                <small>Openness: {entry.openness_checks?.length ? entry.openness_checks.join(", ") : "None"}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

SpecificationAnalysisForm.propTypes = {
  entries: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

SpecificationAnalysisForm.defaultProps = {
  saving: false,
};

export default SpecificationAnalysisForm;
