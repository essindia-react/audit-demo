import { useState } from "react";
import PropTypes from "prop-types";

const stakeholderTypes = [
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
];

const stakeholderRoles = [
  { value: "user", label: "User" },
  { value: "approver", label: "Approver" },
  { value: "specialist", label: "Specialist" },
];

const levels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const initialState = {
  name: "",
  stakeholder_type: stakeholderTypes[0].value,
  role: stakeholderRoles[0].value,
  interest_level: levels[0].value,
  influence_level: levels[0].value,
};

function StakeholderForm({ entries, onSubmit, saving }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name) return;
    onSubmit(form)
      .then(() => setForm(initialState))
      .catch(() => {});
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Stakeholder analysis</h2>
          <p className="muted">Map stakeholders across type, role, interest and influence to feed the matrix.</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Name*</span>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Director of Procurement" required />
        </label>
        <label>
          <span>Stakeholder type</span>
          <select name="stakeholder_type" value={form.stakeholder_type} onChange={handleChange}>
            {stakeholderTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Role</span>
          <select name="role" value={form.role} onChange={handleChange}>
            {stakeholderRoles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Interest level</span>
          <select name="interest_level" value={form.interest_level} onChange={handleChange}>
            {levels.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Influence level</span>
          <select name="influence_level" value={form.influence_level} onChange={handleChange}>
            {levels.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving..." : "Save stakeholder"}
        </button>
      </form>
      <div className="section">
        <div className="section-header">
          <h3>Stakeholder matrix</h3>
          <p className="muted">{entries.length} records</p>
        </div>
        {!entries.length && <p className="muted">No stakeholder records yet.</p>}
        <ul className="requirement-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div>
                <strong>{entry.name}</strong>
                <p>
                  Type: {entry.stakeholder_type} • Role: {entry.role}
                </p>
                <small>
                  Interest: {entry.interest_level} • Influence: {entry.influence_level}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

StakeholderForm.propTypes = {
  entries: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

StakeholderForm.defaultProps = {
  saving: false,
};

export default StakeholderForm;
