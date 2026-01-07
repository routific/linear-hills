export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-primary/20"></div>
          <div className="absolute inset-0 inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-primary" style={{ animationDuration: '0.8s' }}></div>
        </div>
        <p className="mt-6 text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  );
}
