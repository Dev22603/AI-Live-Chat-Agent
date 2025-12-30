import { ApiResponse, ChatData, HistoryData } from '@/types/api';
import { API_ENDPOINTS, CHAT_CONFIG } from '@/constants/chat';
import { config } from '@/config/env';

export async function sendMessage(
  message: string,
  conversationId?: string | null
): Promise<ApiResponse<ChatData>> {
  try {
    const response = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.GOOGLE_API_KEY}`,
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId || undefined,
      }),
      signal: AbortSignal.timeout(CHAT_CONFIG.REQUEST_TIMEOUT),
    });

    if (!response.ok) {
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      } else {
        // Response is not JSON (likely HTML error page)
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse.substring(0, 200));
        throw new Error(`Server error (${response.status}): Unable to process request`);
      }
    }

    // Parse JSON response
    const data: ApiResponse<ChatData> = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw handleApiError(error);
  }
}

export async function getConversationHistory(
  conversationId: string
): Promise<ApiResponse<HistoryData>> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.GET_HISTORY}?conversationId=${encodeURIComponent(conversationId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(CHAT_CONFIG.REQUEST_TIMEOUT),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch history');
    }

    const data: ApiResponse<HistoryData> = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw handleApiError(error);
  }
}

function handleApiError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new Error('Request timed out. Please try again.');
    }
    return error;
  }
  return new Error('An unexpected error occurred');
}
