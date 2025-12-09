import { useState } from "react";
import PropTypes from "prop-types";

const initialState = {
  title: "",
  procuring_entity: "",
  sector: "",
  country: "Nigeria",
  start_date: "",
  end_date: "",
  budget_amount: "",
  description: "",
};

function NewAuditForm({ onSubmit }) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title || !form.procuring_entity) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        budget_amount: form.budget_amount ? Number(form.budget_amount) : null,
      });
      setForm(initialState);
    } catch (error) {
      console.error("Failed to create audit", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <h2>Create audit</h2>
          <p className="muted">Capture entity, timeframe, and budget to begin the audit.</p>
        </div>
      </div>
      <div className="form-grid">
        <label>
          <span>Audit title*</span>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Health Ministry ICT refresh" />
        </label>
        <label>
          <span>Procuring entity*</span>
          <input name="procuring_entity" value={form.procuring_entity} onChange={handleChange} required placeholder="Federal Ministry of Health" />
        </label>
        <label>
          <span>Sector</span>
          <input name="sector" value={form.sector} onChange={handleChange} placeholder="Transport / Health / Energy" />
        </label>
        <label>
          <span>Country</span>
          <input name="country" value={form.country} onChange={handleChange} />
        </label>
        <label>
          <span>Start date</span>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
        </label>
        <label>
          <span>End date</span>
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
        </label>
        <label>
          <span>Budget (₦)</span>
          <input type="number" name="budget_amount" value={form.budget_amount} onChange={handleChange} min="0" step="0.01" placeholder="500000000" />
        </label>
        <label className="full-width">
          <span>Summary</span>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Key objectives, timelines, and sensitivities" />
        </label>
      </div>
      <button type="submit" className="primary" disabled={submitting}>
        {submitting ? "Creating..." : "Add audit"}
      </button>
    </form>
  );
}

NewAuditForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default NewAuditForm;
