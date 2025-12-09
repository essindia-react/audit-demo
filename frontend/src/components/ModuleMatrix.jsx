import PropTypes from "prop-types";
import { useMemo } from "react";

const sectionLabels = {
  core: "A. Core Audit Modules",
  monitoring: "B. Monitoring & Evaluation",
  technical: "C. Technical Modules",
  supporting: "D. Supporting Modules",
};

const formatStatus = (value) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (s) => s.toUpperCase()) : "Not Started";

const buildSubmoduleCode = (moduleCode, index) => `${moduleCode}.${String(index + 1).padStart(2, "0")}`;

function ModuleMatrix({ catalog, statuses, onSelectSubmodule }) {
  const statusMap = useMemo(() => {
    const map = new Map();
    (statuses || []).forEach((item) => {
      map.set(`${item.module_code}|${item.submodule_code}`, item);
    });
    return map;
  }, [statuses]);

  const renderSubmodule = (module, title, index) => {
    const submoduleCode = buildSubmoduleCode(module.code, index);
    const key = `${module.code}|${submoduleCode}`;
    const record = statusMap.get(key);
    const compliance = record?.compliance_status || "not_started";

    return (
      <li key={submoduleCode} className="module-row">
        <div>
          <p className="module-row-title">{title}</p>
          <small className="muted">Code: {submoduleCode}</small>
        </div>
        <div className="module-row-actions">
          <span className={`badge badge-${compliance}`}>{formatStatus(compliance)}</span>
          {onSelectSubmodule && (
            <button type="button" className="text-btn" onClick={() => onSelectSubmodule({ module, submoduleCode, title, record })}>
              Update
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="panel module-matrix">
      <div className="panel-header">
        <div>
          <h2>Module coverage</h2>
          <p className="muted">Track every module (A–D) requested in the TOR.</p>
        </div>
      </div>
      {Object.entries(catalog).map(([section, modules]) => (
        <section key={section} className="module-section">
          <header>
            <h3>{sectionLabels[section] || section}</h3>
            <p className="muted">{modules.length} module{modules.length === 1 ? "" : "s"}</p>
          </header>
          {modules.map((module) => (
            <details key={module.code} open={section === "core" && Number(module.code.slice(-2)) <= 2}>
              <summary>
                <div>
                  <strong>
                    {module.code}: {module.title}
                  </strong>
                  <p>{module.description}</p>
                </div>
                <span className="pill">{module.submodules.length} sub-modules</span>
              </summary>
              <ul className="module-submodule-list">
                {module.submodules.map((submodule, index) => renderSubmodule(module, submodule, index))}
              </ul>
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}

ModuleMatrix.propTypes = {
  catalog: PropTypes.shape({
    core: PropTypes.array,
    monitoring: PropTypes.array,
    technical: PropTypes.array,
    supporting: PropTypes.array,
  }),
  statuses: PropTypes.array,
  onSelectSubmodule: PropTypes.func,
};

ModuleMatrix.defaultProps = {
  catalog: { core: [], monitoring: [], technical: [], supporting: [] },
  statuses: [],
  onSelectSubmodule: undefined,
};

export default ModuleMatrix;
