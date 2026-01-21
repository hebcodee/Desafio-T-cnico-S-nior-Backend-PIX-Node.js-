import axios from "axios";

export function httpClient(timeoutMs: number) {
    return axios.create({
        timeout: timeoutMs,
        headers: { "User-Agent": "pix-orchestrator-challenge/1.0" }
    });
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 2,
    delayMs = 200
): Promise<T> {
    let lastErr: any;

    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (e) {
            lastErr = e;
        }

        if (i < retries) {
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }

    throw lastErr;
}
