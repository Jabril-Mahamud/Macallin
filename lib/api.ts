// lib/api.ts
export async function fetchAudio(text: string): Promise<ArrayBuffer> {
  const response = await fetch('/api/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to convert text to audio');
  }

  return await response.arrayBuffer();
}

export function createAudioUrl(audioData: ArrayBuffer): string {
  const blob = new Blob([audioData], { type: 'audio/mpeg' });
  return URL.createObjectURL(blob);
}