import { Button } from '@/components/ui/button';

type LoadingButtonProps = {
  isLoading: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function LoadingButton({ isLoading, onClick, children }: LoadingButtonProps) {
  return (
    <Button onClick={onClick} disabled={isLoading}>
      {isLoading ? 'Loading...' : children}
    </Button>
  );
}
