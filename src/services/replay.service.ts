import apiClient from "./api";

export interface ReplaySession {
  sessionId: string;
  userKey: string;
  appKey: string;
  createdAt: string;
  lastEventAt: string | null;
  eventCount: number;
}

class ReplayService {
  /**
   * Start a new replay session
   */
  async startSession(userKey: string, appKey: string): Promise<string> {
    const response = await apiClient.post("/replay/start", {
      userKey,
      appKey,
    });

    return response.data.data.sessionId;
  }

  /**
   * Append events to a session
   */
  async appendEvents(
    sessionId: string,
    userKey: string,
    appKey: string,
    events: any[],
    timestamp: number
  ): Promise<void> {
    try {
      await apiClient.post("/replay/append", {
        sessionId,
        userKey,
        appKey,
        events,
        ts: timestamp,
      });
    } catch (error) {
      console.error("Failed to append events:", error);
      throw error;
    }
  }

  /**
   * List sessions (admin only)
   */
  async listSessions(params: {
    userKey?: string;
    appKey?: string;
    limit?: number;
    page?: number;
  }): Promise<any> {
    const response = await apiClient.get("/replay/sessions", { params });
    const data = response.data.data;
    return {
      data: data.data || [],
      current_page: data.current_page || 1,
      last_page: data.last_page || 1,
      per_page: data.per_page || 20,
      total: data.total || 0,
    };
  }

  /**
   * Get session events for replay (admin only)
   */
  async getSession(sessionId: string): Promise<{
    sessionId: string;
    userKey: string;
    appKey: string;
    createdAt: string;
    lastEventAt: string | null;
    eventCount: number;
    events: any[];
  }> {
    const response = await apiClient.get(`/replay/session/${sessionId}`);
    return response.data.data;
  }

  /**
   * Delete a session (admin only)
   */
  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/replay/session/${sessionId}`);
  }
}

export default new ReplayService();

