import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type LoadingButtonProps = {
  isLoading: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function LoadingButton({ 
  isLoading, 
  onClick, 
  children, 
  className,
  disabled 
}: LoadingButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : children}
    </Button>
  );
}