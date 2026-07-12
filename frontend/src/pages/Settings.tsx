import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { authService } from "../services/auth.service";
import { contentService } from "../services/content.service";
import { collectionService } from "../services/collection.service";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

export function SettingsPage() {
  const { addToast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Active User";
  const [email, setEmail] = useState("");

  // Change Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Danger zone state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError(null);
    setUpdatingPassword(true);

    try {
      await authService.changePassword({ oldPassword, newPassword });
      addToast("Password updated successfully!", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError("Failed to update password. Please check your credentials.");
      }
      addToast("Failed to update password.", "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleExportWorkspace = async () => {
    try {
      addToast("Preparing export file...", "info");
      const contents = await contentService.getContents();
      const collections = await collectionService.getCollections();
      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        collections,
        contents,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `brainly_workspace_export_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast("Workspace exported successfully!", "success");
    } catch (err) {
      console.error("Export error:", err);
      addToast("Failed to export workspace.", "error");
    }
  };

  const triggerImportFileSelect = () => {
    const fileInput = document.getElementById("import-file-input");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImportFile(file);
      setIsImportConfirmOpen(true);
    }
    // Clear value so the same file can be re-selected if needed
    e.target.value = "";
  };

  const handleImportWorkspace = async () => {
    if (!pendingImportFile) return;

    setImporting(true);
    addToast("Importing backup workspace...", "info");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (
          !data.contents ||
          !data.collections ||
          !Array.isArray(data.contents) ||
          !Array.isArray(data.collections)
        ) {
          addToast("Invalid backup file format.", "error");
          setImporting(false);
          return;
        }

        const existingColls = await collectionService.getCollections();
        const collNameMap: Record<string, string> = {};
        existingColls.forEach((c) => {
          collNameMap[c.name.toLowerCase()] = c.id;
        });

        const collIdMapping: Record<string, string> = {};

        // 1. Resolve/Recreate collections
        for (const backupColl of data.collections) {
          const nameLower = backupColl.name.toLowerCase();
          if (collNameMap[nameLower]) {
            collIdMapping[backupColl.id] = collNameMap[nameLower];
          } else {
            try {
              const created = await collectionService.createCollection(backupColl.name);
              collIdMapping[backupColl.id] = created.id;
              collNameMap[nameLower] = created.id;
            } catch (cErr) {
              console.error("Failed to create collection during import:", backupColl.name, cErr);
            }
          }
        }

        // 2. Resolve/Recreate content
        let importedCount = 0;
        for (const backupContent of data.contents) {
          const mappedCollId = backupContent.collectionId
            ? collIdMapping[backupContent.collectionId]
            : undefined;

          const payload = {
            title: backupContent.title,
            description: backupContent.description || "",
            link: backupContent.link || "",
            type: backupContent.type,
            category: backupContent.category || "General",
            favorite: !!backupContent.favorite,
            pinned: !!backupContent.pinned,
            status: backupContent.status || "To Read",
            tags: backupContent.tags || [],
            collectionId: mappedCollId || null,
          };

          try {
            await contentService.createContent(payload);
            importedCount++;
          } catch (cErr) {
            console.error("Failed to import content item:", backupContent.title, cErr);
          }
        }

        addToast(`Workspace import complete. Imported ${importedCount} items.`, "success");
      } catch (err) {
        console.error("Import processing failed:", err);
        addToast("Failed to parse or process backup file.", "error");
      } finally {
        setImporting(false);
        setPendingImportFile(null);
      }
    };
    reader.readAsText(pendingImportFile);
  };

  const handleSimulateDeleteAccount = () => {
    addToast("Account deleted (simulation)", "success");
    logout();
    navigate("/signup");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
        <div>
          <h1 className="text-xl font-black text-brand-text tracking-tight uppercase">Workspace Settings</h1>
          <p className="text-brand-sub text-xs mt-1">
            Manage your account profiles, change credentials, and run workspace import/export workflows.
          </p>
        </div>

        {/* Profile Card */}
        <section className="bg-brand-secondary border border-brand-border rounded-premium p-6 shadow-premium-sm space-y-4">
          <h2 className="text-sm font-bold text-brand-text border-b border-brand-border pb-3.5 flex items-center gap-2">
            <span>👤</span>
            <span>Profile Information</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-sub uppercase tracking-wider mb-2">
                Active Username
              </label>
              <div className="bg-brand-primary border border-brand-borderAccent rounded-btn px-4 py-2.5 text-xs text-brand-muted select-all font-bold tracking-wide uppercase">
                {username}
              </div>
            </div>
            <div>
              <Input
                label="Email Address (Placeholder)"
                placeholder="Enter email (e.g. user@example.com)"
                value={email}
                onChange={setEmail}
              />
            </div>
          </div>
        </section>

        {/* Change Password Card */}
        <section className="bg-brand-secondary border border-brand-border rounded-premium p-6 shadow-premium-sm space-y-4">
          <h2 className="text-sm font-bold text-brand-text border-b border-brand-border pb-3.5 flex items-center gap-2">
            <span>🔒</span>
            <span>Change Password</span>
          </h2>
          <form onSubmit={handlePasswordChange}>
            <fieldset disabled={updatingPassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter old password"
                  value={oldPassword}
                  onChange={setOldPassword}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={setNewPassword}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              </div>

              {passwordError && (
                <div className="text-xs font-semibold text-red-500">{passwordError}</div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  title={updatingPassword ? "Updating..." : "Update Password"}
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={updatingPassword}
                />
              </div>
            </fieldset>
          </form>
        </section>

        {/* Export / Import Card */}
        <section className="bg-brand-secondary border border-brand-border rounded-premium p-6 shadow-premium-sm space-y-4">
          <h2 className="text-sm font-bold text-brand-text border-b border-brand-border pb-3.5 flex items-center gap-2">
            <span>💾</span>
            <span>Backup & Sync</span>
          </h2>
          <p className="text-xs text-brand-sub leading-relaxed">
            Backup your entire Second Brain contents, collections, pinned bookmarks, tags, and reading states as a JSON archive. You can restore this archive back at any time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              title="Export Workspace (JSON)"
              variant="primary"
              size="md"
              onClick={handleExportWorkspace}
            />
            <Button
              title="Import Workspace (JSON)"
              variant="secondary"
              size="md"
              onClick={triggerImportFileSelect}
            />
            <input
              id="import-file-input"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </section>

        {/* Danger Zone Card */}
        <section className="bg-red-500/5 border border-red-500/20 rounded-premium p-6 space-y-4">
          <h2 className="text-sm font-bold text-red-500 border-b border-red-500/10 pb-3.5 flex items-center gap-2">
            <span>⚠️</span>
            <span>Danger Zone</span>
          </h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-xs text-red-500 uppercase tracking-wider">Delete Account</h3>
              <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">
                Once you delete your account, there is no going back. All saved resources will be permanently removed.
              </p>
            </div>
            <div>
              <Button
                title="Delete Account"
                variant="danger"
                size="md"
                onClick={() => setIsDeleteModalOpen(true)}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleSimulateDeleteAccount}
        title="Delete Account?"
        message="Are you sure you want to delete your account? This will log you out permanently and delete all contents on screen (simulation)."
        confirmText="Yes, Delete"
        type="danger"
      />

      <ConfirmModal
        isOpen={isImportConfirmOpen}
        onClose={() => {
          setIsImportConfirmOpen(false);
          setPendingImportFile(null);
        }}
        onConfirm={handleImportWorkspace}
        title="Import Workspace?"
        message={`Are you sure you want to import workspace backup data from "${pendingImportFile?.name}"? Existing collections and items will be synced or created.`}
        confirmText={importing ? "Importing..." : "Yes, Import"}
      />
    </Layout>
  );
}

export default SettingsPage;
