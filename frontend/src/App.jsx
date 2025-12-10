import { useCallback, useEffect, useRef, useState } from "react";
import SummaryCards from "./components/SummaryCards";
import AuditList from "./components/AuditList";
import NewAuditForm from "./components/NewAuditForm";
import AuditDetail from "./components/AuditDetail";
import ChecklistPanel from "./components/ChecklistPanel";
import ModuleMatrix from "./components/ModuleMatrix";
import ModuleStatusForm from "./components/ModuleStatusForm";
import AuthPanel from "./components/AuthPanel";
import RequirementForm from "./components/RequirementForm";
import StakeholderForm from "./components/StakeholderForm";
import CriticalNeedsForm from "./components/CriticalNeedsForm";
import {
  auditsApi,
  authApi,
  lookupsApi,
  requirementsApi,
  stakeholdersApi,
  criticalNeedsApi,
  setAccessToken,
  getAccessToken,
} from "./api/client";
import { fallbackBppSteps } from "./data/bppSteps";
import { fallbackModuleCatalog } from "./data/modules";
import "./App.css";

const defaultComplianceOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "compliant", label: "Compliant" },
  { value: "partially_compliant", label: "Partially Compliant" },
  { value: "non_compliant", label: "Non Compliant" },
];

const defaultSeverityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function App() {
  const [audits, setAudits] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [bppSteps, setBppSteps] = useState(fallbackBppSteps);
  const [complianceOptions, setComplianceOptions] = useState(defaultComplianceOptions);
  const [severityOptions, setSeverityOptions] = useState(defaultSeverityOptions);
  const [dashboard, setDashboard] = useState(null);
  const [moduleCatalog, setModuleCatalog] = useState(fallbackModuleCatalog);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [moduleEditor, setModuleEditor] = useState(null);
  const [moduleSaving, setModuleSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [requirementSaving, setRequirementSaving] = useState(false);
  const [stakeholderSaving, setStakeholderSaving] = useState(false);
  const [criticalNeedSaving, setCriticalNeedSaving] = useState(false);
  const toastTimeout = useRef();

  const showToast = useCallback((message, variant = "info") => {
    if (toastTimeout.current) window.clearTimeout(toastTimeout.current);
    setNotification({ message, variant });
    toastTimeout.current = window.setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    async function hydrateAuth() {
      const token = getAccessToken();
      if (!token) {
        setAuthReady(true);
        return;
      }
      try {
        const profile = await authApi.me();
        setCurrentUser(profile);
      } catch {
        setAccessToken(null);
      } finally {
        setAuthReady(true);
      }
    }

    hydrateAuth();
  }, []);

  const loadAuditDetail = useCallback(
    async (auditId) => {
      if (!auditId) return;
      try {
        const detail = await auditsApi.detail(auditId);
        setSelectedAudit(detail);
      } catch (error) {
        showToast(error.message, "error");
      }
    },
    [showToast]
  );

  const loadDashboard = useCallback(async () => {
    try {
      const summary = await auditsApi.dashboard();
      setDashboard(summary);
    } catch (error) {
      console.warn("Dashboard unavailable", error);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function bootstrap() {
      setLoading(true);
      try {
        const auditList = await auditsApi.list().catch(() => []);
        const steps = await lookupsApi.bppSteps().catch(() => fallbackBppSteps);
        const compliance = await lookupsApi.complianceOptions().catch(() => defaultComplianceOptions);
        const severity = await lookupsApi.severityOptions().catch(() => defaultSeverityOptions);
        const modules = await lookupsApi.modules().catch(() => fallbackModuleCatalog);

        setAudits(auditList);
        setBppSteps(steps.length ? steps : fallbackBppSteps);
        setComplianceOptions(compliance);
        setSeverityOptions(severity);
        setModuleCatalog(modules && Object.keys(modules).length ? modules : fallbackModuleCatalog);

        if (auditList.length) {
          const firstId = auditList[0].id;
          setSelectedAuditId(firstId);
          await loadAuditDetail(firstId);
        } else {
          setSelectedAudit(null);
          setSelectedAuditId(null);
        }

        await loadDashboard();
      } catch (error) {
        showToast(error.message, "error");
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [currentUser, loadAuditDetail, loadDashboard, showToast]);

  useEffect(() => {
    setModuleEditor(null);
  }, [selectedAuditId]);

  const handleAuditSelect = async (auditId) => {
    setSelectedAuditId(auditId);
    await loadAuditDetail(auditId);
  };

  const handleCreateAudit = async (payload) => {
    try {
      const record = await auditsApi.create(payload);
      setAudits((prev) => [record, ...prev]);
      setSelectedAuditId(record.id);
      await loadAuditDetail(record.id);
      await loadDashboard();
      showToast("Audit created", "success");
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    }
  };

  const handleStepSubmit = async (payload) => {
    if (!selectedAuditId) return;
    try {
      await auditsApi.upsertStep(selectedAuditId, payload);
      await loadAuditDetail(selectedAuditId);
      await loadDashboard();
      showToast("Step updated", "success");
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    }
  };

  const handleFindingSubmit = async (payload) => {
    if (!selectedAuditId) return;
    try {
      await auditsApi.addFinding(selectedAuditId, payload);
      await loadAuditDetail(selectedAuditId);
      await loadDashboard();
      showToast("Finding captured", "success");
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    }
  };

  const handleModuleStatusSelect = ({ module, submoduleCode, title, record }) => {
    setModuleEditor({
      moduleCode: module.code,
      moduleTitle: module.title,
      submoduleCode,
      submoduleTitle: title,
      record,
    });
  };

  const handleModuleStatusSubmit = async (updates) => {
    if (!selectedAuditId || !moduleEditor) return;
    setModuleSaving(true);
    try {
      await auditsApi.upsertModuleStatus(selectedAuditId, {
        module_code: moduleEditor.moduleCode,
        submodule_code: moduleEditor.submoduleCode,
        compliance_status: updates.compliance_status,
        owner: updates.owner || null,
        notes: updates.notes || null,
        evidence_reference: updates.evidence_reference || null,
      });
      await loadAuditDetail(selectedAuditId);
      showToast("Module status updated", "success");
      setModuleEditor(null);
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    } finally {
      setModuleSaving(false);
    }
  };

  const handleModuleStatusCancel = () => setModuleEditor(null);

  const handleLogin = async (credentials) => {
    setAuthLoading(true);
    try {
      const result = await authApi.login(credentials);
      setAccessToken(result.access_token);
      setCurrentUser(result.user);
      showToast("Welcome back!", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setAuthLoading(true);
    try {
      const result = await authApi.register(payload);
      setAccessToken(result.access_token);
      setCurrentUser(result.user);
      showToast("Account created", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRequirementSubmit = async (formData) => {
    if (!selectedAuditId) return;
    setRequirementSaving(true);
    try {
      await requirementsApi.create(selectedAuditId, formData);
      await loadAuditDetail(selectedAuditId);
      showToast("Requirement captured", "success");
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    } finally {
      setRequirementSaving(false);
    }
  };

  const handleStakeholderSubmit = async (payload) => {
    if (!selectedAuditId) return;
    setStakeholderSaving(true);
    try {
      await stakeholdersApi.create(selectedAuditId, payload);
      await loadAuditDetail(selectedAuditId);
      showToast("Stakeholder captured", "success");
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    } finally {
      setStakeholderSaving(false);
    }
  };

  const handleCriticalNeedSubmit = async (payload) => {
    if (!selectedAuditId) return;
    setCriticalNeedSaving(true);
    try {
      await criticalNeedsApi.create(selectedAuditId, payload);
      await loadAuditDetail(selectedAuditId);
      showToast("Need scored", "success");
    } catch (error) {
      showToast(error.message, "error");
      throw error;
    } finally {
      setCriticalNeedSaving(false);
    }
  };

  if (!authReady || (currentUser && loading)) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading procurement audit workspace...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-shell">
        <AuthPanel
          mode={authMode}
          onModeChange={setAuthMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={authLoading}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1>Procurement Audit & Evaluation</h1>
          <p className="muted">
            Built for Nigerian BPP nine-step audits with World Bank alignment, offline resilience, and evidence capture.
          </p>
        </div>
        <div className="user-pill">
          <span>{currentUser.full_name || "Auditor"}</span>
          <small>{currentUser.email}</small>
        </div>
      </header>

      {notification && (
        <div className={`toast toast-${notification.variant}`}>
          {notification.message}
        </div>
      )}

      <div className="layout-grid">
        <div className="column">
          <SummaryCards data={dashboard} />
          <AuditList audits={audits} selectedId={selectedAuditId} onSelect={handleAuditSelect} />
          <NewAuditForm onSubmit={handleCreateAudit} />
        </div>

        <div className="column column-wide">
          {selectedAudit ? (
            <AuditDetail
              audit={selectedAudit}
              bppSteps={bppSteps}
              complianceOptions={complianceOptions}
              severityOptions={severityOptions}
              onSubmitStep={handleStepSubmit}
              onAddFinding={handleFindingSubmit}
            />
          ) : (
            <div className="panel empty-state">
              <h2>No audit selected</h2>
              <p>Choose an audit from the list or create a new one to get started.</p>
            </div>
          )}
          {selectedAudit && (
            <RequirementForm
              entries={selectedAudit.requirements || []}
              onSubmit={handleRequirementSubmit}
              saving={requirementSaving}
            />
          )}
          {selectedAudit && (
            <CriticalNeedsForm
              entries={selectedAudit.critical_needs || []}
              onSubmit={handleCriticalNeedSubmit}
              saving={criticalNeedSaving}
            />
          )}
        </div>

        <div className="column">
          <ChecklistPanel steps={bppSteps} audit={selectedAudit} />
          <ModuleMatrix
            catalog={moduleCatalog}
            statuses={selectedAudit?.module_statuses || []}
            onSelectSubmodule={handleModuleStatusSelect}
          />
          {moduleEditor && (
            <ModuleStatusForm
              editor={moduleEditor}
              complianceOptions={complianceOptions}
              onSubmit={handleModuleStatusSubmit}
              onCancel={handleModuleStatusCancel}
              saving={moduleSaving}
            />
          )}
          {selectedAudit && (
            <StakeholderForm
              entries={selectedAudit.requirement_stakeholders || []}
              onSubmit={handleStakeholderSubmit}
              saving={stakeholderSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
