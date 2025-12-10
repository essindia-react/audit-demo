import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const buildInitial = (editor, defaultStatus) => ({
  compliance_status: editor?.record?.compliance_status || defaultStatus,
  owner: editor?.record?.owner || "",
  evidence_reference: editor?.record?.evidence_reference || "",
  notes: editor?.record?.notes || "",
});

function ModuleStatusForm({ editor, complianceOptions, onSubmit, onCancel, saving }) {
  const defaultStatus = complianceOptions[0]?.value || "not_started";
  const [form, setForm] = useState(() => buildInitial(editor, defaultStatus));

  useEffect(() => {
    setForm(buildInitial(editor, defaultStatus));
  }, [editor, defaultStatus]);

  if (!editor) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...form });
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <h2>Update module status</h2>
          <p className="muted">
            {editor.moduleCode} · {editor.moduleTitle}
          </p>
          <small>{editor.submoduleCode} · {editor.submoduleTitle}</small>
        </div>
      </div>
      <div className="form-grid">
        <label>
          <span>Compliance status</span>
          <select name="compliance_status" value={form.compliance_status} onChange={handleChange}>
            {complianceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Owner</span>
          <input name="owner" value={form.owner} onChange={handleChange} placeholder="Module lead" />
        </label>
        <label>
          <span>Evidence reference</span>
          <input name="evidence_reference" value={form.evidence_reference} onChange={handleChange} placeholder="File name / doc link" />
        </label>
        <label className="full-width">
          <span>Notes</span>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Observations, risks, or pending actions" />
        </label>
      </div>
      <div className="button-row">
        <button type="button" className="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving..." : "Save status"}
        </button>
      </div>
    </form>
  );
}

ModuleStatusForm.propTypes = {
  editor: PropTypes.shape({
    moduleCode: PropTypes.string,
    moduleTitle: PropTypes.string,
    submoduleCode: PropTypes.string,
    submoduleTitle: PropTypes.string,
    record: PropTypes.object,
  }),
  complianceOptions: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

ModuleStatusForm.defaultProps = {
  editor: null,
  saving: false,
};

export default ModuleStatusForm;
