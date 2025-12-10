import { useState } from "react";
import PropTypes from "prop-types";

const scoreOptions = [1, 2, 3, 4, 5];

const initialState = {
  need_item: "",
  urgency_score: 3,
  importance_score: 3,
};

function CriticalNeedsForm({ entries, onSubmit, saving }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name.includes("score") ? Number(value) : value }));
  };

  const currentCritical = form.urgency_score + form.importance_score >= 7 || (form.urgency_score >= 4 && form.importance_score >= 4);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.need_item) return;
    onSubmit(form)
      .then(() => setForm(initialState))
      .catch(() => {});
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Critical needs assessment</h2>
          <p className="muted">Score urgency vs importance to auto-flag critical requirements.</p>
        </div>
        <span className={`pill ${currentCritical ? "badge-non_compliant" : "badge-compliant"}`}>
          {currentCritical ? "Critical" : "Non-critical"}
        </span>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="full-width">
          <span>Need item*</span>
          <input name="need_item" value={form.need_item} onChange={handleChange} placeholder="e.g. Emergency power backup" required />
        </label>
        <label>
          <span>Urgency score</span>
          <select name="urgency_score" value={form.urgency_score} onChange={handleChange}>
            {scoreOptions.map((score) => (
              <option key={score} value={score}>
                {score}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Importance score</span>
          <select name="importance_score" value={form.importance_score} onChange={handleChange}>
            {scoreOptions.map((score) => (
              <option key={score} value={score}>
                {score}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving..." : "Save need"}
        </button>
      </form>
      <div className="section">
        <div className="section-header">
          <h3>Needs prioritization</h3>
          <p className="muted">{entries.length} records</p>
        </div>
        {!entries.length && <p className="muted">No needs captured yet.</p>}
        <ul className="requirement-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div>
                <strong>{entry.need_item}</strong>
                <p>
                  Urgency: {entry.urgency_score} • Importance: {entry.importance_score}
                </p>
                <small>Status: {entry.is_critical ? "Critical" : "Non-critical"}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

CriticalNeedsForm.propTypes = {
  entries: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

CriticalNeedsForm.defaultProps = {
  saving: false,
};

export default CriticalNeedsForm;
