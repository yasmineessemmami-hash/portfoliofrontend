import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminCard, AdminButton } from "@/components/Admin";
import replayService from "@/services/replay.service";
import { Search, Play, Calendar, User, Tag, Trash2 } from "lucide-react";

interface Session {
  id: number;
  session_id: string;
  user_key: string;
  app_key: string;
  created_at: string;
  last_event_at: string | null;
  event_count: number;
}

export default function ReplaysAdmin() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUserKey, setSearchUserKey] = useState("");
  const [searchAppKey, setSearchAppKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await replayService.listSessions({
        userKey: searchUserKey || undefined,
        appKey: searchAppKey || undefined,
        limit: 20,
        page: currentPage,
      });

      setSessions(response.data || []);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadSessions();
  };

  const handleReplay = (sessionId: string) => {
    navigate(`/admin/replays/${sessionId}`);
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return;
    }

    // Optimistic update - remove from UI immediately
    const deletedSession = sessions.find((s) => s.session_id === sessionId);
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));

    try {
      await replayService.deleteSession(sessionId);
    } catch (error) {
      console.error("Failed to delete session:", error);
      // Revert on error
      if (deletedSession) {
        setSessions((prev) => [...prev, deletedSession].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
      alert("Failed to delete session. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Session Replays</h1>
        <p className="text-muted-foreground mt-2">
          View and replay user session recordings
        </p>
      </div>

      {/* Search Filters */}
      <AdminCard>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                User Key
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={searchUserKey}
                  onChange={(e) => setSearchUserKey(e.target.value)}
                  placeholder="Filter by user key..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                App Key
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  value={searchAppKey}
                  onChange={(e) => setSearchAppKey(e.target.value)}
                  placeholder="Filter by app key..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <AdminButton onClick={handleSearch} className="w-full md:w-auto">
            <Search className="w-4 h-4 mr-2" />
            Search
          </AdminButton>
        </div>
      </AdminCard>

      {/* Sessions Table */}
      <AdminCard>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sessions found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Session ID</th>
                    <th className="text-left py-3 px-4 font-semibold">User Key</th>
                    <th className="text-left py-3 px-4 font-semibold">App Key</th>
                    <th className="text-left py-3 px-4 font-semibold">Created</th>
                    <th className="text-left py-3 px-4 font-semibold">Last Event</th>
                    <th className="text-left py-3 px-4 font-semibold">Events</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-border hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <code className="text-xs bg-secondary px-2 py-1 rounded">
                          {session.session_id.substring(0, 16)}...
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-secondary px-2 py-1 rounded">
                          {session.user_key.substring(0, 16)}...
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-secondary px-2 py-1 rounded">
                          {session.app_key.substring(0, 16)}...
                        </code>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.created_at)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {session.last_event_at
                          ? formatDate(session.last_event_at)
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">
                          {session.event_count}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <AdminButton
                            onClick={() => handleReplay(session.session_id)}
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Replay
                          </AdminButton>
                          <AdminButton
                            onClick={() => handleDelete(session.session_id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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

