import PropTypes from "prop-types";

const formatStatus = (status) => status.replace(/_/g, " ").replace(/\b\w/g, (s) => s.toUpperCase());

function AuditList({ audits, selectedId, onSelect }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>Audit portfolio</h2>
          <p className="muted">Select an audit to review compliance progress.</p>
        </div>
        <span className="pill">{audits.length} records</span>
      </div>
      <ul className="audit-list">
        {!audits.length && <li className="muted">Create your first audit to begin tracking.</li>}
        {audits.map((audit) => (
          <li
            key={audit.id}
            className={`audit-item ${selectedId === audit.id ? "is-active" : ""}`}
            onClick={() => onSelect(audit.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => event.key === "Enter" && onSelect(audit.id)}
          >
            <div>
              <div className="audit-title">{audit.title}</div>
              <div className="audit-meta">
                {audit.procuring_entity} • <span className={`status-dot ${audit.status}`}></span>
                {formatStatus(audit.status)}
              </div>
            </div>
            <div className="audit-dates">
              {audit.start_date || audit.end_date ? (
                <>
                  <small>Start: {audit.start_date || "TBC"}</small>
                  <small>End: {audit.end_date || "TBC"}</small>
                </>
              ) : (
                <small>Schedule pending</small>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

AuditList.propTypes = {
  audits: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedId: PropTypes.number,
  onSelect: PropTypes.func.isRequired,
};

export default AuditList;
