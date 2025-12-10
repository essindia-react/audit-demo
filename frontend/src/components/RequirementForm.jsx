import { useState } from "react";
import PropTypes from "prop-types";

const initialState = {
  title: "",
  description: "",
  justification: "",
  expected_outcomes: "",
  estimated_cost: "",
  evidence: null,
};

function RequirementForm({ entries, onSubmit, saving }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title || !form.justification) return;
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("justification", form.justification);
    formData.append("description", form.description);
    formData.append("expected_outcomes", form.expected_outcomes);
    if (form.estimated_cost) {
      formData.append("estimated_cost", form.estimated_cost);
    }
    if (form.evidence) {
      formData.append("evidence", form.evidence);
    }
    onSubmit(formData)
      .then(() => setForm(initialState))
      .catch(() => {});
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Requirement Identification</h2>
          <p className="muted">Capture the foundational procurement need, justification, and supporting evidence.</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Requirement title*</span>
          <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Hospital diagnostic equipment" required />
        </label>
        <label className="full-width">
          <span>Detailed description</span>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the scope, beneficiaries, and constraints" />
        </label>
        <label className="full-width">
          <span>Purpose / justification*</span>
          <textarea name="justification" value={form.justification} onChange={handleChange} rows={3} placeholder="Why is this requirement critical?" required />
        </label>
        <label className="full-width">
          <span>Expected outcomes</span>
          <textarea name="expected_outcomes" value={form.expected_outcomes} onChange={handleChange} rows={2} placeholder="Intended results and KPIs" />
        </label>
        <label>
          <span>Estimated cost (₦)</span>
          <input type="number" min="0" step="0.01" name="estimated_cost" value={form.estimated_cost} onChange={handleChange} placeholder="500000000" />
        </label>
        <label>
          <span>Evidence upload</span>
          <input type="file" name="evidence" accept=".pdf,.doc,.docx,image/*" onChange={handleChange} />
        </label>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving..." : "Save requirement"}
        </button>
      </form>
      <div className="section">
        <div className="section-header">
          <h3>Captured requirements</h3>
          <p className="muted">{entries.length} entries</p>
        </div>
        {!entries.length && <p className="muted">No requirement entries yet.</p>}
        <ul className="requirement-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.description || "No description provided."}</p>
                <small>
                  Estimated cost:{" "}
                  {entry.estimated_cost ? `₦${Number(entry.estimated_cost).toLocaleString()}` : "N/A"}
                </small>
              </div>
              {entry.evidence_path && (
                <a className="text-btn" href={entry.evidence_path} target="_blank" rel="noreferrer">
                  Evidence
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

RequirementForm.propTypes = {
  entries: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

RequirementForm.defaultProps = {
  saving: false,
};

export default RequirementForm;
