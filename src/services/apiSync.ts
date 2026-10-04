/**
 * LOOK ENGLISH - Client-Server Synchronization Service
 * Đảm bảo mọi thay đổi trên máy tính (Admin xóa tin tức, thêm học phí)
 * được đồng bộ hóa tức thì sang điện thoại di động và ngược lại.
 */

export interface SyncPayload {
  announcements?: any[];
  mediaItems?: any[];
  tuitionFees?: any[];
  users?: any[];
  classes?: any[];
  attendance?: any[];
  evaluations?: any[];
  grades?: any[];
  assignments?: any[];
  checkIns?: any[];
  leaderboard?: any[];
}

export const fetchServerState = async (): Promise<any | null> => {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (err) {
    console.warn('Sync server offline or unavailable:', err);
    return null;
  }
};

export const pushServerState = async (data: SyncPayload): Promise<boolean> => {
  try {
    const res = await fetch('/api/sync-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json?.success || false;
  } catch (err) {
    console.warn('Failed to push state to server:', err);
    return false;
  }
};

export const clearMockDataOnServer = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/clear-mock-data', {
      method: 'POST',
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to clear mock data on server:', err);
    return false;
  }
};
