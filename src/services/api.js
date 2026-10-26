// Backend API base URL: configurable via VITE_API_URL / VITE_API_BASE_URL env variables,
// falling back to deployed Render backend URL in production, or localhost in development.
const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://utkarshraj874-up-scholorship-backend.onrender.com"
    : "http://localhost:8000");

export const API_BASE = rawApiBase.replace(/\/+$/, "");

function getHeaders(isFormData = false) {
  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("scholarship_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function getErrorMessage(detail, fallback) {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail
      .map((issue) => issue?.msg)
      .filter((message) => typeof message === "string" && message.length > 0);
    if (messages.length) {
      return messages.join(". ");
    }
  }
  return fallback;
}

async function readError(res, fallback) {
  const error = await res.json().catch(() => ({}));
  return new Error(getErrorMessage(error.detail, fallback));
}

export const api = {
  // 1. User Authentication
  async login(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }
    return res.json();
  },

  async register(name, email, password, role = "student") {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  // New password‑reset helpers
  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/password-reset/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to request password reset");
    }
    return res.json();
  },

  async resetPassword(email, otp, newPassword) {
    const res = await fetch(`${API_BASE}/password-reset/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to reset password");
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Unauthorized");
    }
    return res.json();
  },

  // 2. Student Profile
  async getMyProfile() {
    const res = await fetch(`${API_BASE}/profiles/me`, {
      headers: getHeaders(),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch profile");
    }
    return res.json();
  },

  async saveProfile(profileData) {
    const res = await fetch(`${API_BASE}/profiles`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(getErrorMessage(err.detail, "Failed to save profile"));
    }
    return res.json();
  },

  async updateProfile(profileId, profileData) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(getErrorMessage(err.detail, "Failed to update profile"));
    }
    return res.json();
  },

  async deleteProfile(profileId) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to delete profile");
    }
    return res.json();
  },

  // 3. Document Management
  async getDocuments(userId) {
    const url = userId ? `${API_BASE}/documents/?user_id=${userId}` : `${API_BASE}/documents/`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch documents");
    }
    return res.json();
  },

  async uploadDocument(formData) {
    const res = await fetch(`${API_BASE}/documents/`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to upload document");
    }
    return res.json();
  },

  async getDocumentFileUrl(category, userId) {
    const url = userId
      ? `${API_BASE}/documents/${category}/file?user_id=${userId}`
      : `${API_BASE}/documents/${category}/file`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to get document file link");
    }
    return res.json();
  },

  async deleteDocument(category, userId) {
    const url = userId
      ? `${API_BASE}/documents/${category}?user_id=${userId}`
      : `${API_BASE}/documents/${category}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to delete document");
    }
    return res.json();
  },

  // 4. Admin / Coordinator Endpoints
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch admin dashboard stats");
    }
    return res.json();
  },

  async getAdminStudents(search = "") {
    const url = search
      ? `${API_BASE}/admin/students?search=${encodeURIComponent(search)}`
      : `${API_BASE}/admin/students`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch students list");
    }
    return res.json();
  },

  async getStudentDocuments(studentId) {
    const res = await fetch(`${API_BASE}/admin/students/${studentId}/documents`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch student documents");
    }
    return res.json();
  },

  async reviewDocument(documentId, status, adminRemarks) {
    const res = await fetch(`${API_BASE}/admin/documents/${documentId}/review`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        status,
        admin_remarks: adminRemarks,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to submit document review");
    }
    return res.json();
  },

  // 5. Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications/`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch notifications");
    }
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "PUT",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to mark notification as read");
    }
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: "PUT",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to mark all notifications as read");
    }
    return res.json();
  },

  // 6. Help Desk (Student queries & Coordinator responses)
  async createHelpQuery(subject, message) {
    const res = await fetch(`${API_BASE}/help-desk/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ subject, message }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to submit help query");
    }
    return res.json();
  },

  async getMyHelpQueries() {
    const res = await fetch(`${API_BASE}/help-desk/my-queries`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch your help queries");
    }
    return res.json();
  },

  async getAllHelpQueries(status = "") {
    const url = status
      ? `${API_BASE}/help-desk/all?status=${encodeURIComponent(status)}`
      : `${API_BASE}/help-desk/all`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to fetch student queries");
    }
    return res.json();
  },

  async replyHelpQuery(queryId, adminReply) {
    const res = await fetch(`${API_BASE}/help-desk/${queryId}/reply`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ admin_reply: adminReply }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to reply to help query");
    }
    return res.json();
  },

  // 7. Scholarship assistant
  async getChatConversations() {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw await readError(res, "Failed to load chat history");
    return res.json();
  },

  async createChatConversation(title = "New conversation") {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw await readError(res, "Failed to create conversation");
    return res.json();
  },

  async getChatConversation(conversationId) {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw await readError(res, "Failed to load conversation");
    return res.json();
  },

  async deleteChatConversation(conversationId) {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw await readError(res, "Failed to delete conversation");
    return res.json();
  },

  async streamChatMessage(conversationId, content, { onToken, signal } = {}) {
    const res = await fetch(
      `${API_BASE}/chat/conversations/${conversationId}/messages/stream`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ content }),
        signal,
      },
    );
    if (!res.ok) throw await readError(res, "Failed to send message");
    if (!res.body) throw new Error("Streaming is not supported by this browser");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let response = "";

    const processEvents = (chunk) => {
      buffer += chunk;
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";
      for (const event of events) {
        const data = event
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");
        if (!data) continue;
        let payload;
        try {
          payload = JSON.parse(data);
        } catch {
          throw new Error("Received an invalid response from the assistant");
        }
        if (payload.error) throw new Error(payload.error);
        if (typeof payload.token === "string") {
          response += payload.token;
          onToken?.(payload.token);
        }
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        processEvents(decoder.decode(value, { stream: true }));
      }
      processEvents(decoder.decode());
    } finally {
      reader.releaseLock();
    }
    return response;
  },
};

// End of API service
