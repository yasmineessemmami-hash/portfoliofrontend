import { useState, useEffect } from "react";
import {
  Mail,
  RefreshCw,
  CheckCircle,
  Clock,
  User,
  AtSign,
  MessageSquare,
  FileText,
} from "lucide-react";
import { contactService } from "@/services/contact.service";
import { AdminCard, AdminButton, AdminLoadingState } from "@/components/Admin";
import { motion } from "framer-motion";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  company?: string;
  reason?: string;
  budget?: string;
  timeline?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

const AdminContactSubmissions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactService.getContactSubmissions();
      const data = response.data || response;
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submissions");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await contactService.markSubmissionAsRead(id);
      setSubmissions(submissions.map(s => s.id === id ? { ...s, is_read: true, read_at: new Date().toISOString() } : s));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission({ ...selectedSubmission, is_read: true, read_at: new Date().toISOString() });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = submissions.filter(s => !s.is_read).length;

  if (loading) return <AdminLoadingState message="Loading contact submissions..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Contact Submissions</h1>
            <p className="text-sm text-muted-foreground">
              Manage and view messages from contact form
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {unreadCount} unread
            </span>
          )}
          <AdminButton onClick={fetchSubmissions} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </AdminButton>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-1 space-y-3">
          <AdminCard>
            <h2 className="text-lg font-semibold mb-4">All Submissions</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No submissions yet.
                </p>
              ) : (
                submissions.map((submission) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedSubmission(submission)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedSubmission?.id === submission.id
                        ? 'border-primary bg-primary/5'
                        : submission.is_read
                        ? 'border-border bg-background hover:bg-secondary/50'
                        : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm truncate">
                            {submission.name}
                          </span>
                          {!submission.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <AtSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {submission.email}
                          </span>
                        </div>
                        {submission.subject && (
                          <p className="text-xs font-medium text-foreground mt-1 truncate">
                            {submission.subject}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {submission.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(submission.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </AdminCard>
        </div>

        {/* Submission Detail */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <AdminCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Message Details</h2>
                {!selectedSubmission.is_read && (
                  <AdminButton
                    onClick={() => handleMarkAsRead(selectedSubmission.id)}
                    size="sm"
                    variant="secondary"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Read
                  </AdminButton>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Name</span>
                    </div>
                    <p className="text-foreground font-medium">{selectedSubmission.name}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AtSign className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-primary hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>
                </div>

                {(selectedSubmission.company || selectedSubmission.reason || selectedSubmission.budget || selectedSubmission.timeline) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedSubmission.company && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>Company</span>
                        </div>
                        <p className="text-foreground font-medium">{selectedSubmission.company}</p>
                      </div>
                    )}
                    {selectedSubmission.reason && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>Reason for Contact</span>
                        </div>
                        <p className="text-foreground font-medium">{selectedSubmission.reason}</p>
                      </div>
                    )}
                    {selectedSubmission.budget && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>Budget Range</span>
                        </div>
                        <p className="text-foreground font-medium">{selectedSubmission.budget}</p>
                      </div>
                    )}
                    {selectedSubmission.timeline && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>Timeline</span>
                        </div>
                        <p className="text-foreground font-medium">{selectedSubmission.timeline}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedSubmission.subject && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>Subject</span>
                    </div>
                    <p className="text-foreground font-medium">{selectedSubmission.subject}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-foreground whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Submitted: {formatDate(selectedSubmission.created_at)}</span>
                  </div>
                  {selectedSubmission.is_read && selectedSubmission.read_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4" />
                      <span>Read: {formatDate(selectedSubmission.read_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </AdminCard>
          ) : (
            <AdminCard>
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a submission to view details
                </p>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactSubmissions;

