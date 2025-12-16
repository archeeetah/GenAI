import { getAuth } from 'firebase/auth';
import app from './firebase'; // Adjust if your firebase init is elsewhere, assuming app/lib or just lib

// Types based on backend models
export interface ChatRequest {
    user_id: string;
    session_id: string;
    message: string;
    doc_id?: string;
    history?: { role: string; parts: string[] }[];
}

export interface ChatResponse {
    response: string;
    doc_id?: string;
    status: string;
    agent_used: string;
    process_log: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function sendMessage(
    message: string,
    user_id: string,
    session_id: string,
    doc_id?: string
): Promise<ChatResponse> {
    const payload: ChatRequest = {
        user_id,
        session_id,
        message,
        doc_id
    };

    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to send message');
    }

    return response.json();
}

export async function getHistory(user_id: string, session_id?: string) {
    const url = new URL(`${API_BASE_URL}/history/${user_id}`);
    if (session_id) {
        url.searchParams.append('session_id', session_id);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }

    return response.json();
}

export async function uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-doc`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload document');
    }

    return response.json();
}
