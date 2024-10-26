'use client'
import { useState, useEffect, useCallback } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Input } from '@/components/ui/input'; // Ensure this is correctly defined in your project
import { LoadingButton } from '@/components/LoadingButton';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from 'lucide-react';
import OswaldIcon from "@/components/images/Oswald.png";
import DorothyIcon from "@/components/images/Dorothy.png";

interface Voice {
  name: string;
  id: string;
  icon: StaticImageData;
  description: string;
}

interface AudioConverterProps {
  maxLength?: number;
}

const VOICE_OPTIONS: Voice[] = [
  { 
    name: 'Oswald', 
    id: 'Pw7NjARk1Tw61eca5OiP', 
    icon: OswaldIcon,
    description: 'A friendly male voice that speaks clearly'
  },
  { 
    name: 'Dorothy', 
    id: 'ThT5KcBeYPX3keUQqHPh', 
    icon: DorothyIcon,
    description: 'A warm female voice that speaks gently'
  },
];

export function AudioConverter({ maxLength = 1000 }: AudioConverterProps) {
  const [text, setText] = useState<string>('');
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_OPTIONS[0].id);

  const { toast } = useToast();

  useEffect(() => {
    const currentAudioUrl = audioSrc;
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [audioSrc]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setText(newText);
    }
  }, [maxLength]);

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) {
      toast({
        description: 'Please add some text first',
        variant: 'default',
      });
      return;
    }

    setIsLoading(true);
    let newAudioUrl: string | null = null;

    try {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: text.trim(),
          selectedVoiceId 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate audio');
      }

      const audioData = await response.arrayBuffer();
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      newAudioUrl = URL.createObjectURL(blob);
      setAudioSrc(newAudioUrl);

      toast({
        description: 'Your audio is ready! 🎉',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        description: 'Sorry, please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [text, audioSrc, selectedVoiceId, toast]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Volume2 className="h-6 w-6" />
          Text to Speech
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Input
            id="text-input"
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading && text.trim()) {
                handleSubmit();
              }
            }}
            placeholder="Type here..."
            disabled={isLoading}
            maxLength={maxLength}
            aria-label="Text to convert to speech"
            className="h-20 p-4 text-lg rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
          <p className="text-sm text-muted-foreground text-right" aria-live="polite">
            {text.length} / {maxLength}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4" role="radiogroup">
            {VOICE_OPTIONS.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoiceId(voice.id)}
                className={`p-4 rounded-lg transition-all flex flex-col items-center space-y-2
                  ${selectedVoiceId === voice.id 
                    ? 'bg-blue-50 border-2 border-blue-500 shadow-md scale-105' 
                    : 'border-2 border-gray-200 hover:border-blue-300'
                  }`}
                aria-checked={selectedVoiceId === voice.id}
                role="radio"
              >
                <Image
                  src={voice.icon}
                  alt={voice.name} // Descriptive alt text for accessibility
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <span className="font-medium">{voice.name}</span>
                <span className="text-sm text-center text-gray-600">
                  {voice.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <LoadingButton
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={!text.trim()}
          className="w-full h-12 text-lg font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          {isLoading ? 'Converting...' : 'Speak It!'}
        </LoadingButton>

        {audioSrc && (
          <div className="rounded-lg border bg-green-50 p-6 shadow">
            <audio
              controls
              src={audioSrc}
              className="w-full rounded-lg"
              onError={() => {
                toast({
                  description: 'Could not play audio. Please try again.',
                  variant: 'destructive',
                });
                setAudioSrc(null);
              }}
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
