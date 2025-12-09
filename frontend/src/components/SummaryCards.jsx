import PropTypes from "prop-types";

const formatPercent = (value, total) => {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

function SummaryCards({ data }) {
  if (!data) {
    return (
      <div className="panel">
        <div className="panel-header">
          <h2>Portfolio snapshot</h2>
        </div>
        <p className="muted">Run the backend API to see live metrics.</p>
      </div>
    );
  }

  const severity = data.findings_by_severity || {};
  const compliance = data.compliance_distribution || {};

  return (
    <div className="summary-grid">
      <div className="panel">
        <div className="metric-value">{data.total_audits}</div>
        <div className="metric-label">Audits captured</div>
        <p className="metric-subtext">{data.open_audits} active / {data.closed_audits} closed</p>
      </div>
      <div className="panel">
        <div className="metric-value">{compliance.compliant || 0}</div>
        <div className="metric-label">Compliant steps</div>
        <p className="metric-subtext">{formatPercent(compliance.compliant || 0, data.total_audits || 1)} of overall portfolio</p>
      </div>
      <div className="panel">
        <div className="metric-value warning">{severity.high || 0}</div>
        <div className="metric-label">High / critical findings</div>
        <p className="metric-subtext">
          {severity.critical ? `${severity.critical} critical issues` : "Monitor outstanding actions"}
        </p>
      </div>
      <div className="panel compliance-panel">
        <div className="panel-header">
          <h3>Compliance distribution</h3>
        </div>
        <div className="badge-row">
          {Object.entries(compliance).map(([status, count]) => (
            <span key={status} className={`badge badge-${status}`}>
              {status.replace(/_/g, " ")}: {count}
            </span>
          ))}
          {!Object.keys(compliance).length && <span className="muted">No step reviews yet.</span>}
        </div>
      </div>
    </div>
  );
}

SummaryCards.propTypes = {
  data: PropTypes.shape({
    total_audits: PropTypes.number,
    open_audits: PropTypes.number,
    closed_audits: PropTypes.number,
    findings_by_severity: PropTypes.object,
    compliance_distribution: PropTypes.object,
  }),
};

export default SummaryCards;
