export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="p-6 rounded-full bg-orange-50 text-orange-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" x2="12" y1="18" y2="24" />
          <line x1="8" x2="16" y1="24" y2="24" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        Work in Progress
      </h2>
      <p className="text-muted-foreground max-w-md">
        This page is currently under construction. Check back soon for updates!
      </p>
    </div>
  );
}
