import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const formatLabel = (value) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (s) => s.toUpperCase()) : "—";

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value)) : "—";

const formatCurrency = (value) => {
  if (!value && value !== 0) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
};

function buildStepInitial(bppSteps, complianceOptions) {
  return {
    step_number: bppSteps[0]?.step ?? 1,
    step_name: bppSteps[0]?.title ?? "",
    compliance_status: complianceOptions[0]?.value ?? "not_started",
    risk_score: "",
    owner: "",
    notes: "",
    evidence_reference: "",
  };
}

function buildFindingInitial(severityOptions) {
  return {
    category: "",
    severity: severityOptions[0]?.value ?? "low",
    description: "",
    recommendation: "",
    corrective_action_owner: "",
    target_date: "",
  };
}

function AuditDetail({
  audit,
  bppSteps,
  complianceOptions,
  severityOptions,
  onSubmitStep,
  onAddFinding,
}) {
  const [stepForm, setStepForm] = useState(() => buildStepInitial(bppSteps, complianceOptions));
  const [findingForm, setFindingForm] = useState(() => buildFindingInitial(severityOptions));
  const [savingStep, setSavingStep] = useState(false);
  const [savingFinding, setSavingFinding] = useState(false);

  useEffect(() => {
    setStepForm(buildStepInitial(bppSteps, complianceOptions));
    setFindingForm(buildFindingInitial(severityOptions));
  }, [audit?.id, bppSteps, complianceOptions, severityOptions]);

  const recordedSteps = audit.steps || [];
  const findings = audit.findings || [];
  const latestUpdated = useMemo(() => {
    if (!recordedSteps.length) return "Not started";
    const sorted = [...recordedSteps].sort((a, b) => new Date(b.last_reviewed_at) - new Date(a.last_reviewed_at));
    return formatDate(sorted[0].last_reviewed_at);
  }, [recordedSteps]);

  const handleStepChange = (event) => {
    const { name, value } = event.target;
    if (name === "step_number") {
      const numeric = Number(value);
      const meta = bppSteps.find((step) => step.step === numeric);
      setStepForm((prev) => ({ ...prev, step_number: numeric, step_name: meta?.title ?? prev.step_name }));
    } else if (name === "risk_score") {
      setStepForm((prev) => ({ ...prev, risk_score: value }));
    } else {
      setStepForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFindingChange = (event) => {
    const { name, value } = event.target;
    setFindingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepSubmit = async (event) => {
    event.preventDefault();
    setSavingStep(true);
    try {
      await onSubmitStep({
        ...stepForm,
        risk_score: stepForm.risk_score ? Number(stepForm.risk_score) : null,
      });
      setStepForm(buildStepInitial(bppSteps, complianceOptions));
    } catch (error) {
      console.error("Unable to save step", error);
    } finally {
      setSavingStep(false);
    }
  };

  const handleFindingSubmit = async (event) => {
    event.preventDefault();
    if (!findingForm.description) return;
    setSavingFinding(true);
    try {
      await onAddFinding({
        ...findingForm,
        target_date: findingForm.target_date || null,
      });
      setFindingForm(buildFindingInitial(severityOptions));
    } catch (error) {
      console.error("Unable to save finding", error);
    } finally {
      setSavingFinding(false);
    }
  };

  return (
    <div className="panel audit-detail">
      <div className="panel-header">
        <div>
          <h2>{audit.title}</h2>
          <p className="muted">{audit.description || "Use the forms below to capture compliance and findings."}</p>
        </div>
        <span className={`pill status-${audit.status}`}>{formatLabel(audit.status)}</span>
      </div>

      <div className="info-grid">
        <div>
          <small>Procuring entity</small>
          <strong>{audit.procuring_entity}</strong>
        </div>
        <div>
          <small>Sector</small>
          <strong>{audit.sector || "—"}</strong>
        </div>
        <div>
          <small>Budget</small>
          <strong>{formatCurrency(audit.budget_amount)}</strong>
        </div>
        <div>
          <small>Timeline</small>
          <strong>
            {formatDate(audit.start_date)} – {formatDate(audit.end_date)}
          </strong>
        </div>
      </div>

      <section className="section">
        <div className="section-header">
          <div>
            <h3>Compliance tracker</h3>
            <p className="muted">Last updated: {latestUpdated}</p>
          </div>
        </div>
        <div className="step-table-wrapper">
          <table className="step-table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {!recordedSteps.length && (
                <tr>
                  <td colSpan={5} className="muted">
                    No step reviews captured yet.
                  </td>
                </tr>
              )}
              {recordedSteps.map((step) => (
                <tr key={step.id}>
                  <td>
                    <strong>
                      {step.step_number}. {step.step_name}
                    </strong>
                  </td>
                  <td>{step.owner || "—"}</td>
                  <td>
                    <span className={`badge badge-${step.compliance_status}`}>
                      {formatLabel(step.compliance_status)}
                    </span>
                  </td>
                  <td>{step.risk_score ?? "—"}</td>
                  <td>{step.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h3>Update step status</h3>
        </div>
        <form className="form-grid" onSubmit={handleStepSubmit}>
          <label>
            <span>BPP step</span>
            <select name="step_number" value={stepForm.step_number} onChange={handleStepChange}>
              {bppSteps.map((step) => (
                <option key={step.step} value={step.step}>
                  {step.step}. {step.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Compliance</span>
            <select name="compliance_status" value={stepForm.compliance_status} onChange={handleStepChange}>
              {complianceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Risk score (0-100)</span>
            <input type="number" name="risk_score" value={stepForm.risk_score} onChange={handleStepChange} min="0" max="100" />
          </label>
          <label>
            <span>Owner</span>
            <input name="owner" value={stepForm.owner} onChange={handleStepChange} placeholder="Audit lead" />
          </label>
          <label className="full-width">
            <span>Notes</span>
            <textarea name="notes" value={stepForm.notes} onChange={handleStepChange} rows={3} placeholder="Summarise evidence, escalation, or monitoring signal" />
          </label>
          <label className="full-width">
            <span>Evidence reference</span>
            <input name="evidence_reference" value={stepForm.evidence_reference} onChange={handleStepChange} placeholder="Link, file name, or coded reference" />
          </label>
          <button type="submit" className="primary" disabled={savingStep}>
            {savingStep ? "Saving..." : "Save step update"}
          </button>
        </form>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h3>Findings & recommendations</h3>
            <p className="muted">Capture anomalies, lessons, and remediation owners.</p>
          </div>
          <span className="pill">{findings.length} findings</span>
        </div>
        <div className="findings-grid">
          {!findings.length && <p className="muted">No findings recorded yet.</p>}
          {findings.map((finding) => (
            <article key={finding.id} className="finding-card">
              <header>
                <span className={`badge badge-${finding.severity}`}>{formatLabel(finding.severity)}</span>
                <strong>{finding.category}</strong>
                <small>Owner: {finding.corrective_action_owner || "TBC"}</small>
              </header>
              <p>{finding.description}</p>
              {finding.recommendation && (
                <p className="muted">Recommendation: {finding.recommendation}</p>
              )}
              <footer>
                <small>Target date: {formatDate(finding.target_date)}</small>
                <small>Status: {finding.resolved ? "Resolved" : "Open"}</small>
              </footer>
            </article>
          ))}
        </div>
        <form className="form-grid" onSubmit={handleFindingSubmit}>
          <label>
            <span>Category</span>
            <input name="category" value={findingForm.category} onChange={handleFindingChange} placeholder="e.g. Transparency" />
          </label>
          <label>
            <span>Severity</span>
            <select name="severity" value={findingForm.severity} onChange={handleFindingChange}>
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Target date</span>
            <input type="date" name="target_date" value={findingForm.target_date} onChange={handleFindingChange} />
          </label>
          <label>
            <span>Action owner</span>
            <input name="corrective_action_owner" value={findingForm.corrective_action_owner} onChange={handleFindingChange} placeholder="Director of Procurement" />
          </label>
          <label className="full-width">
            <span>Description*</span>
            <textarea name="description" value={findingForm.description} onChange={handleFindingChange} required rows={3} placeholder="Summarise the observation and evidence" />
          </label>
          <label className="full-width">
            <span>Recommendation</span>
            <textarea name="recommendation" value={findingForm.recommendation} onChange={handleFindingChange} rows={2} placeholder="Immediate action, policy reference, escalation" />
          </label>
          <button type="submit" className="secondary" disabled={savingFinding}>
            {savingFinding ? "Saving..." : "Add finding"}
          </button>
        </form>
      </section>
    </div>
  );
}

AuditDetail.propTypes = {
  audit: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    procuring_entity: PropTypes.string.isRequired,
    sector: PropTypes.string,
    budget_amount: PropTypes.number,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    status: PropTypes.string.isRequired,
    steps: PropTypes.array,
    findings: PropTypes.array,
  }).isRequired,
  bppSteps: PropTypes.array.isRequired,
  complianceOptions: PropTypes.array.isRequired,
  severityOptions: PropTypes.array.isRequired,
  onSubmitStep: PropTypes.func.isRequired,
  onAddFinding: PropTypes.func.isRequired,
};

export default AuditDetail;
