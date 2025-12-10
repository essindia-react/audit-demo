import PropTypes from "prop-types";

const formatCompliance = (value) => value.replace(/_/g, " ").replace(/\b\w/g, (s) => s.toUpperCase());

function ChecklistPanel({ steps, audit }) {
  const stepStatuses = new Map(
    (audit?.steps || []).map((step) => [step.step_number, step.compliance_status])
  );

  return (
    <div className="panel checklist">
      <div className="panel-header">
        <div>
          <h2>BPP nine steps + monitoring</h2>
          <p className="muted">World Bank alignment is highlighted for each stage.</p>
        </div>
      </div>
      <div className="checklist-accordion">
        {steps.map((item) => {
          const compliance = stepStatuses.get(item.step) || "not_started";
          return (
            <details key={item.step} open={item.step <= 2}>
              <summary>
                <div>
                  <strong>
                    Step {item.step}: {item.title}
                  </strong>
                  <p>{item.description}</p>
                </div>
                <span className={`badge badge-${compliance}`}>
                  {formatCompliance(compliance)}
                </span>
              </summary>
              <ul>
                {item.checkpoints.map((checkpoint) => (
                  <li key={checkpoint}>{checkpoint}</li>
                ))}
              </ul>
              {item.world_bank_alignment && (
                <p className="muted">
                  World Bank focus: {item.world_bank_alignment.join(", ")}
                </p>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}

ChecklistPanel.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      step: PropTypes.number,
      title: PropTypes.string,
      description: PropTypes.string,
      checkpoints: PropTypes.arrayOf(PropTypes.string),
      world_bank_alignment: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  audit: PropTypes.object,
};

export default ChecklistPanel;
