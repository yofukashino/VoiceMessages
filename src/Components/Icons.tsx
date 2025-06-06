export const mic = ({
  children,
  ...props
}: React.SVGProps<SVGSVGElement> & { children?: React.ReactNode }): React.ReactElement => {
  return (
    <svg {...props} viewBox="0 0 24 24" width={props.width ?? "24"} height={props.height ?? "24"}>
      <path
        d="M8 7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11C16 13.21 14.21 15 12 15C9.79 15 8 13.21 8 11V7Z"
        style={{
          fill: "currentColor",
        }}
      />

      <path
        className="vmm-transparent-fill"
        d="M5 11C5 14.87 8.13 18 12 18C15.87 18 19 14.87 19 11"
        stroke-width="2"
        stroke-linecap="round"
        style={{
          stroke: "currentColor",
        }}
      />

      <rect
        x="11"
        y="18.5"
        width="2"
        height="3.5"
        rx="1"
        style={{
          fill: "currentColor",
        }}
      />
      <rect
        x="8"
        y="23"
        width="8"
        height="2"
        rx="1"
        style={{
          fill: "currentColor",
        }}
      />
      {children}
    </svg>
  );
};

export default { mic };
