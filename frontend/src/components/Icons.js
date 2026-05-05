import React from 'react';

const baseProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
};

export const HomeIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 12l9-9 9 9" />
    <path d="M5 10v10a1 1 0 0 0 1 1h4v-7h4v7h4a1 1 0 0 0 1-1V10" />
  </svg>
);

export const FolderIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const LogoutIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const PlusIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const ClockIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const AlertIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 9v4" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    <path d="M10.3 3.86l-8.76 15A2 2 0 0 0 3.27 22h17.46a2 2 0 0 0 1.73-3.14l-8.76-15a2 2 0 0 0-3.4 0z" />
  </svg>
);

export const InboxIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export const PlayIcon = (props) => (
  <svg {...baseProps} {...props}>
    <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
  </svg>
);

export const CalendarIcon = (props) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

export const UserIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const FolderTagIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const TrashIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export const EyeIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
    <path d="M9.36 5.36A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17.5 17.5 0 0 1-3.36 4.36" />
    <path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
  </svg>
);

export const SunIcon = (props) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const MoonIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

export const SparkleIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
  </svg>
);
