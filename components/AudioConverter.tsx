// components/AudioConverter.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/LoadingButton';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface AudioConverterProps {
  maxLength?: number;
}

// Define available voices and corresponding IDs
const VOICE_OPTIONS = [
  { name: 'Oswald', id: 'Pw7NjARk1Tw61eca5OiP' }, // Replace with actual ElevenLabs Voice ID
  { name: 'Dorothy', id: 'ThT5KcBeYPX3keUQqHPh' },
  // Add more voices with their specific IDs as needed
];

export function AudioConverter({ maxLength = 1000 }: AudioConverterProps) {
  const [text, setText] = useState('');
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_OPTIONS[0].id);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    if (maxLength && newText.length <= maxLength) {
      setText(newText);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some text to convert.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
        setAudioSrc(null);
      }

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, selectedVoiceId }) // Pass selectedVoiceId to API
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate audio');
      }

      const audioData = await response.arrayBuffer();
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      setAudioSrc(url);
      
      toast({
        description: 'Audio generated successfully! 🎉',
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error generating audio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [text, audioSrc, selectedVoiceId, toast]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Input
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading && text.trim()) {
                handleSubmit();
              }
            }}
            placeholder="Type or paste your text here..."
            disabled={isLoading}
            maxLength={maxLength}
          />
          <p className="text-sm text-muted-foreground text-right">
            {text.length}/{maxLength} characters
          </p>
        </div>

        {/* Voice selection dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Voice:</label>
          <select
            value={selectedVoiceId}
            onChange={(e) => setSelectedVoiceId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {VOICE_OPTIONS.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        <LoadingButton 
          onClick={handleSubmit} 
          isLoading={isLoading}
          disabled={!text.trim()}
          className="w-full"
        >
          Convert to Audio
        </LoadingButton>

        {audioSrc && (
          <div className="rounded-lg border bg-card p-4">
            <audio 
              controls 
              src={audioSrc} 
              className="w-full"
              onError={() => {
                toast({
                  title: 'Error',
                  description: 'Failed to play audio. Please try again.',
                  variant: 'destructive',
                });
                setAudioSrc(null);
              }}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AudioConverter;
