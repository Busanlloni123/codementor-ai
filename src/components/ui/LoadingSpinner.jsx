export default function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`${sizes[size]} border-2 border-surface-border border-t-primary-500 rounded-full animate-spin`}
    />
  );
}