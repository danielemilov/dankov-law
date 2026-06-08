export default function ShareIcon({
  size = 18,
  strokeWidth = 2,
  className = '',
  title,
  ...props
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      {...props}
    >
      {title && <title>{title}</title>}

      {/* Стрелката нагоре */}
      <path d="M12 15V3" />
      <path d="M7.5 7.5 12 3l4.5 4.5" />

      {/* Отворената горе кутия */}
      <path d="M5 11.5v7A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-7" />
    </svg>
  );
}