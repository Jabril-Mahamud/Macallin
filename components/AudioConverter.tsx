import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/LoadingButton';
import { fetchAudio } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

export function AudioConverter() {
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTextChange = (e:any) => {
    setText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const audioUrl = await fetchAudio(text);
      setAudioSrc(audioUrl);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error fetching audio. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={text}
        onChange={handleTextChange}
        placeholder="Type or paste your text here..."
      />
      <LoadingButton onClick={handleSubmit} isLoading={isLoading}>
        Convert to Audio
      </LoadingButton>
      {audioSrc && (
        <audio controls src={audioSrc} className="w-full mt-4">
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
