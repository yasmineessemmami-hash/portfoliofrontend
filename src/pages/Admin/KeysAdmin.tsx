import { useState, useEffect } from "react";
import { AdminCard, AdminButton } from "@/components/Admin";
import apiClient from "@/services/api";
import { Search, Edit, Trash2, Save, X, User, Tag, Plus } from "lucide-react";

interface UserKey {
  id: number;
  key: string;
  label: string;
  ip_address: string | null;
  created_at: string;
}

interface AppKey {
  id: number;
  key: string;
  source: string;
  created_at: string;
}

export default function KeysAdmin() {
  const [activeTab, setActiveTab] = useState<"users" | "apps">("users");
  const [userKeys, setUserKeys] = useState<UserKey[]>([]);
  const [appKeys, setAppKeys] = useState<AppKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newSource, setNewSource] = useState("");

  const loadUserKeys = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/keys/users", {
        params: { search, page: currentPage, limit: 20 },
      });
      setUserKeys(response.data.data.data || []);
      setTotalPages(response.data.data.last_page || 1);
    } catch (error) {
      console.error("Failed to load user keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppKeys = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/keys/apps", {
        params: { search, page: currentPage, limit: 20 },
      });
      setAppKeys(response.data.data.data || []);
      setTotalPages(response.data.data.last_page || 1);
    } catch (error) {
      console.error("Failed to load app keys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      loadUserKeys();
    } else {
      loadAppKeys();
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    if (activeTab === "users") {
      loadUserKeys();
    } else {
      loadAppKeys();
    }
  }, [search]);

  const handleEdit = (item: UserKey | AppKey) => {
    setEditingId(item.id);
    if (activeTab === "users") {
      setEditValue((item as UserKey).label);
    } else {
      setEditValue((item as AppKey).source);
    }
  };

  const handleSave = async (id: number) => {
    // Optimistic update - update UI immediately
    if (activeTab === "users") {
      setUserKeys((prev) =>
        prev.map((key) =>
          key.id === id ? { ...key, label: editValue } : key
        )
      );
    } else {
      setAppKeys((prev) =>
        prev.map((key) =>
          key.id === id ? { ...key, source: editValue } : key
        )
      );
    }

    try {
      if (activeTab === "users") {
        await apiClient.put(`/keys/users/${id}`, { label: editValue });
      } else {
        await apiClient.put(`/keys/apps/${id}`, { source: editValue });
      }
      setEditingId(null);
      setEditValue("");
    } catch (error) {
      console.error("Failed to update:", error);
      // Revert on error
      if (activeTab === "users") {
        loadUserKeys();
      } else {
        loadAppKeys();
      }
      alert("Failed to update. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this key?")) {
      return;
    }

    // Optimistic update - remove from UI immediately
    if (activeTab === "users") {
      const deletedKey = userKeys.find((k) => k.id === id);
      setUserKeys((prev) => prev.filter((key) => key.id !== id));
      setTotalPages((prev) => Math.max(1, prev - (userKeys.length === 1 ? 1 : 0)));

      try {
        await apiClient.delete(`/keys/users/${id}`);
      } catch (error: any) {
        // Revert on error
        if (deletedKey) {
          setUserKeys((prev) => [...prev, deletedKey].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
        }
        alert(error.response?.data?.message || "Failed to delete. Please try again.");
      }
    } else {
      const deletedKey = appKeys.find((k) => k.id === id);
      setAppKeys((prev) => prev.filter((key) => key.id !== id));
      setTotalPages((prev) => Math.max(1, prev - (appKeys.length === 1 ? 1 : 0)));

      try {
        await apiClient.delete(`/keys/apps/${id}`);
      } catch (error: any) {
        // Revert on error
        if (deletedKey) {
          setAppKeys((prev) => [...prev, deletedKey].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
        }
        alert(error.response?.data?.message || "Failed to delete. Please try again.");
      }
    }
  };

  const handleAdd = async () => {
    if (activeTab === "users") {
      if (!newKey || newKey.length !== 4 || !/^[A-Z]{4}$/.test(newKey)) {
        alert("Key must be exactly 4 uppercase letters (e.g., ABCD)");
        return;
      }
      if (!newLabel.trim()) {
        alert("Label is required");
        return;
      }

      // Check if key already exists in current list
      const keyExists = userKeys.some((k) => k.key === newKey.toUpperCase());
      if (keyExists) {
        alert("This key already exists in the current list. Please use a different key.");
        return;
      }

      // Also check backend to ensure uniqueness across all pages
      try {
        const checkResponse = await apiClient.get("/keys/users", {
          params: { search: newKey.toUpperCase(), limit: 1 },
        });
        const existingKeys = checkResponse.data.data.data || [];
        if (existingKeys.some((k: any) => k.key === newKey.toUpperCase())) {
          alert("This key already exists in the database. Please use a different key.");
          return;
        }
      } catch (error) {
        console.error("Failed to check key existence:", error);
        // Continue anyway - backend will catch duplicate
      }
    } else {
      if (!newKey || newKey.length !== 4 || !/^[A-Z]{4}$/.test(newKey)) {
        alert("Key must be exactly 4 uppercase letters (e.g., ABCD)");
        return;
      }
      if (!newSource.trim()) {
        alert("Source is required");
        return;
      }

      // Check if key already exists in current list
      const keyExists = appKeys.some((k) => k.key === newKey.toUpperCase());
      if (keyExists) {
        alert("This key already exists in the current list. Please use a different key.");
        return;
      }

      // Also check backend to ensure uniqueness across all pages
      try {
        const checkResponse = await apiClient.get("/keys/apps", {
          params: { search: newKey.toUpperCase(), limit: 1 },
        });
        const existingKeys = checkResponse.data.data.data || [];
        if (existingKeys.some((k: any) => k.key === newKey.toUpperCase())) {
          alert("This key already exists in the database. Please use a different key.");
          return;
        }
      } catch (error) {
        console.error("Failed to check key existence:", error);
        // Continue anyway - backend will catch duplicate
      }
    }

    // Optimistic update - add to UI immediately
    const newItem = activeTab === "users"
      ? {
        id: Date.now(), // Temporary ID
        key: newKey.toUpperCase(),
        label: newLabel,
        ip_address: null,
        created_at: new Date().toISOString(),
      }
      : {
        id: Date.now(), // Temporary ID
        key: newKey.toUpperCase(),
        source: newSource,
        created_at: new Date().toISOString(),
      };

    if (activeTab === "users") {
      setUserKeys((prev) => [newItem as UserKey, ...prev]);
    } else {
      setAppKeys((prev) => [newItem as AppKey, ...prev]);
    }

    try {
      if (activeTab === "users") {
        const response = await apiClient.post("/user", { userKey: newKey.toUpperCase() });
        // Check if key was created or already existed
        if (response.data.data.id) {
          const realId = response.data.data.id;
          // Update with real ID from backend
          setUserKeys((prev) =>
            prev.map((key) =>
              key.id === Date.now() ? { ...key, id: realId, label: newLabel } : key
            )
          );
          // Update label separately
          await apiClient.put(`/keys/users/${realId}`, { label: newLabel });
          setUserKeys((prev) =>
            prev.map((key) =>
              key.id === realId ? { ...key, label: newLabel } : key
            )
          );
        } else {
          // Key already existed, remove the optimistic update and reload
          setUserKeys((prev) => prev.filter((key) => key.id !== Date.now()));
          alert("This key already exists in the database.");
          return;
        }
      } else {
        const response = await apiClient.post("/app", { appKey: newKey.toUpperCase() });
        // Check if key was created or already existed
        if (response.data.data.id) {
          const realId = response.data.data.id;
          // Update with real ID from backend
          setAppKeys((prev) =>
            prev.map((key) =>
              key.id === Date.now() ? { ...key, id: realId, source: newSource } : key
            )
          );
          // Update source separately
          await apiClient.put(`/keys/apps/${realId}`, { source: newSource });
          setAppKeys((prev) =>
            prev.map((key) =>
              key.id === realId ? { ...key, source: newSource } : key
            )
          );
        } else {
          // Key already existed, remove the optimistic update and reload
          setAppKeys((prev) => prev.filter((key) => key.id !== Date.now()));
          alert("This key already exists in the database.");
          return;
        }
      }
      setNewKey("");
      setNewLabel("");
      setNewSource("");
      setShowAddForm(false);
    } catch (error: any) {
      // Revert on error
      if (activeTab === "users") {
        setUserKeys((prev) => prev.filter((key) => key.id !== Date.now()));
      } else {
        setAppKeys((prev) => prev.filter((key) => key.id !== Date.now()));
      }
      const errorMessage = error.response?.data?.message || "Failed to add key. Please try again.";
      if (error.response?.status === 422 && errorMessage.includes("already exists")) {
        alert("This key already exists in the database. Please use a different key.");
      } else {
        alert(errorMessage);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Keys Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user keys and app keys
        </p>
      </div>

      {/* Tabs */}
      <AdminCard>
        <div className="flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "users"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            User Keys
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "apps"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            App Keys
          </button>
        </div>
      </AdminCard>

      {/* Search and Add */}
      <AdminCard>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeTab === "users" ? "user keys" : "app keys"}...`}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Search keys"
            />
          </div>
          <AdminButton onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New {activeTab === "users" ? "User Key" : "App Key"}
          </AdminButton>
        </div>
      </AdminCard>

      {/* Add Form */}
      {showAddForm && (
        <AdminCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New {activeTab === "users" ? "User Key" : "App Key"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Key (4 uppercase letters)
                </label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="ABCD"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="New key"
                />
              </div>
              {activeTab === "users" ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g., Client Name"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Label"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="e.g., Instagram, PDF, CV"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Source"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <AdminButton onClick={handleAdd}>
                <Save className="w-4 h-4 mr-2" />
                Add Key
              </AdminButton>
              <AdminButton onClick={() => {
                setShowAddForm(false);
                setNewKey("");
                setNewLabel("");
                setNewSource("");
              }} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </AdminButton>
            </div>
          </div>
        </AdminCard>
      )}

      {/* Table */}
      <AdminCard>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : activeTab === "users" ? (
          userKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No user keys found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Key</th>
                      <th className="text-left py-3 px-4 font-semibold">Label</th>
                      <th className="text-left py-3 px-4 font-semibold">IP Address</th>
                      <th className="text-left py-3 px-4 font-semibold">Created</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userKeys.map((key) => (
                      <tr
                        key={key.id}
                        className="border-b border-border hover:bg-secondary/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <code className="text-xs bg-secondary px-2 py-1 rounded">
                            {key.key}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          {editingId === key.id ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="px-2 py-1 border border-border rounded bg-background text-foreground"
                              autoFocus
                            />
                          ) : (
                            <span>{key.label}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {key.ip_address || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(key.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {editingId === key.id ? (
                              <>
                                <AdminButton
                                  onClick={() => handleSave(key.id)}
                                  size="sm"
                                >
                                  <Save className="w-4 h-4" />
                                </AdminButton>
                                <AdminButton
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditValue("");
                                  }}
                                  size="sm"
                                  variant="outline"
                                >
                                  <X className="w-4 h-4" />
                                </AdminButton>
                              </>
                            ) : (
                              <>
                                <AdminButton
                                  onClick={() => handleEdit(key)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="w-4 h-4" />
                                </AdminButton>
                                <AdminButton
                                  onClick={() => handleDelete(key.id)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </AdminButton>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <AdminButton
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      size="sm"
                    >
                      Previous
                    </AdminButton>
                    <AdminButton
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      size="sm"
                    >
                      Next
                    </AdminButton>
                  </div>
                </div>
              )}
            </>
          )
        ) : appKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No app keys found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Key</th>
                    <th className="text-left py-3 px-4 font-semibold">Source</th>
                    <th className="text-left py-3 px-4 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-border hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <code className="text-xs bg-secondary px-2 py-1 rounded">
                          {key.key}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        {editingId === key.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-2 py-1 border border-border rounded bg-background text-foreground"
                            autoFocus
                            aria-label="Edit label"
                          />
                        ) : (
                          <span>{key.source}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(key.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {editingId === key.id ? (
                            <>
                              <AdminButton
                                onClick={() => handleSave(key.id)}
                                size="sm"
                              >
                                <Save className="w-4 h-4" />
                              </AdminButton>
                              <AdminButton
                                onClick={() => {
                                  setEditingId(null);
                                  setEditValue("");
                                }}
                                size="sm"
                                variant="outline"
                              >
                                <X className="w-4 h-4" />
                              </AdminButton>
                            </>
                          ) : (
                            <>
                              <AdminButton
                                onClick={() => handleEdit(key)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="w-4 h-4" />
                              </AdminButton>
                              {key.key !== "UNKN" && (
                                <AdminButton
                                  onClick={() => handleDelete(key.id)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </AdminButton>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <AdminButton
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    size="sm"
                  >
                    Previous
                  </AdminButton>
                  <AdminButton
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    size="sm"
                  >
                    Next
                  </AdminButton>
                </div>
              </div>
            )}
          </>
        )}
      </AdminCard>
    </div>
  );
}

