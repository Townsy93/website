// The designer's testimonial mark (Aug 2026): an orange speech bubble with
// two white quote marks and a tail at the bottom-right, used on every quote
// module. Recreated as inline SVG from the supplied artwork. The bubble
// takes currentColor — Deep Orange by default — and the marks stay literal
// white, so the pairing reads the same on white, tan and Deep Blue.
export function QuoteMark({
  className = "h-12 w-12",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={`text-deep-orange ${className}`}
    >
      <path
        fill="currentColor"
        d="M13 2h22c6.075 0 11 4.925 11 11v14c0 6.075-4.925 11-11 11h-1.6l5.1 9-14.3-9H13C6.925 38 2 33.075 2 27V13C2 6.925 6.925 2 13 2Z"
      />
      <path
        fill="#fff"
        d="M12.5 12h8.5v7.3c0 5-3 8.1-8.5 8.7v-4c2.6-.5 4.1-1.9 4.4-4h-4.4V12Z"
      />
      <path
        fill="#fff"
        d="M26.5 12h8.5v7.3c0 5-3 8.1-8.5 8.7v-4c2.6-.5 4.1-1.9 4.4-4h-4.4V12Z"
      />
    </svg>
  );
}
