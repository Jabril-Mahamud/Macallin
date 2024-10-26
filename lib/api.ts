export async function fetchAudio(text: string): Promise<string> {
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    throw new Error('Failed to convert text to audio');
  }

  const data = await response.json();
  return data.audioUrl;
}
