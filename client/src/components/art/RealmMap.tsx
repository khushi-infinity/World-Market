export function RealmMap() {
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" role="img" aria-label="An inked map of the six guild regions">
      <defs>
        <radialGradient id="mapWash" cx="50%" cy="45%" r="62%">
          <stop offset="0" stopColor="#2a2216" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#16120c" stopOpacity="0.5" />
          <stop offset="1" stopColor="#080706" stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1c1810" />
          <stop offset="0.5" stopColor="#15110c" />
          <stop offset="1" stopColor="#0e0b08" />
        </linearGradient>
        <filter id="ink" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.7" />
        </filter>
      </defs>

      <rect width="1200" height="700" fill="url(#mapWash)" />
      <g opacity="0.25" stroke="#c9a227" strokeWidth="0.6" fill="none">
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M0 ${40 + i * 50} H1200`} opacity={i % 3 === 0 ? 0.5 : 0.18} />
        ))}
        {Array.from({ length: 22 }).map((_, i) => (
          <path key={i} d={`M${30 + i * 55} 0 V700`} opacity={i % 4 === 0 ? 0.4 : 0.12} />
        ))}
      </g>

      <path
        d="M96 430 C130 340 210 306 282 258 C344 216 382 150 470 158 C560 166 600 118 700 136 C790 152 862 106 942 136 C1030 168 1092 224 1122 302 C1152 382 1112 462 1062 522 C1012 582 932 592 862 632 C782 676 692 662 612 622 C532 582 472 602 392 572 C312 542 232 562 172 512 C112 462 72 472 96 430 Z"
        fill="url(#land)"
        stroke="#c9a227"
        strokeWidth="1.2"
        opacity="0.95"
      />
      <path
        d="M96 430 C130 340 210 306 282 258 C344 216 382 150 470 158 C560 166 600 118 700 136 C790 152 862 106 942 136 C1030 168 1092 224 1122 302 C1152 382 1112 462 1062 522 C1012 582 932 592 862 632 C782 676 692 662 612 622 C532 582 472 602 392 572 C312 542 232 562 172 512 C112 462 72 472 96 430 Z"
        fill="none"
        stroke="#e3c274"
        strokeWidth="0.5"
        opacity="0.35"
        transform="translate(4 5)"
      />

      <g stroke="#c9a227" strokeWidth="0.9" fill="none" opacity="0.3" strokeDasharray="3 5">
        <path d="M300 260 C420 300 500 360 560 470" />
        <path d="M600 200 C640 300 660 400 700 520" />
        <path d="M880 220 C860 330 840 430 820 520" />
        <path d="M250 470 C360 440 460 450 560 480" />
        <path d="M720 540 C800 500 860 460 900 400" />
      </g>

      <g stroke="#6f8a94" strokeWidth="1.4" fill="none" opacity="0.45">
        <path d="M700 150 C690 220 660 260 650 320 C640 380 620 430 610 500 C604 540 610 580 620 620" />
        <path d="M980 190 C950 240 930 300 900 350 C875 395 860 440 850 490" />
        <path d="M470 170 C500 220 520 260 540 300" />
      </g>

      <g stroke="#c9a227" strokeWidth="0.8" opacity="0.32">
        <g transform="translate(300 300)">
          <path d="M0 40 L18 0 L34 40 Z" fill="#0d0b08" />
          <path d="M26 44 L44 8 L62 44 Z" fill="#0d0b08" />
          <path d="M52 40 L68 2 L84 40 Z" fill="#0d0b08" />
          <path d="M10 44 L30 12 L50 44" />
          <path d="M40 46 L58 14 L76 46" />
        </g>
        <g transform="translate(930 190)">
          <path d="M0 34 L16 0 L30 34 Z" fill="#0d0b08" />
          <path d="M22 38 L38 4 L54 38 Z" fill="#0d0b08" />
          <path d="M46 34 L60 2 L74 34 Z" fill="#0d0b08" />
        </g>
        <g transform="translate(600 230)" opacity="0.7">
          {[
            [0, 30], [16, 20], [32, 34], [48, 18], [64, 30], [80, 22], [96, 34],
            [8, 46], [26, 40], [44, 50], [62, 42], [80, 48],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} l7 -12 l7 12 Z`} fill="#141a12" />
          ))}
        </g>
        <g transform="translate(820 380)" opacity="0.65">
          {[
            [0, 26], [18, 16], [36, 30], [54, 18], [72, 28], [12, 42], [34, 46], [56, 44],
          ].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} l6 -11 l6 11 Z`} fill="#17130d" />
          ))}
        </g>
        <g transform="translate(180 450)" opacity="0.5" strokeDasharray="2 4">
          <path d="M0 30 C30 10 70 10 100 30" />
          <path d="M10 42 C40 24 80 24 110 42" />
        </g>
      </g>

      <g stroke="#c9a227" strokeWidth="0.7" fill="none" opacity="0.35">
        <path d="M120 600 q14 -10 28 0 q14 10 28 0" />
        <path d="M180 640 q10 -7 20 0 q10 7 20 0" />
        <path d="M1060 620 q12 -8 24 0 q12 8 24 0" />
        <path d="M980 660 q9 -6 18 0 q9 6 18 0" />
        <circle cx="160" cy="620" r="3" />
        <circle cx="1090" cy="650" r="3" />
      </g>

      <g transform="translate(140 560)" stroke="#c9a227" fill="none" opacity="0.5">
        <circle r="38" strokeWidth="0.9" />
        <circle r="28" strokeWidth="0.5" strokeDasharray="2 4" />
        <path d="M0 -44 L8 -8 L0 0 L-8 -8 Z" fill="#c9a227" opacity="0.5" />
        <path d="M0 44 L8 8 L0 0 L-8 8 Z" fill="#c9a227" opacity="0.25" />
        <path d="M-44 0 L-8 8 L0 0 L-8 -8 Z" fill="#c9a227" opacity="0.25" />
        <path d="M44 0 L8 8 L0 0 L8 -8 Z" fill="#c9a227" opacity="0.25" />
        <circle r="2.5" fill="#c9a227" opacity="0.7" />
      </g>

      <g opacity="0.4" stroke="#c9a227" strokeWidth="0.8" fill="none">
        <path d="M1000 560 l22 -10 l-4 12 l14 6 l-24 6 l-8 -14 Z" fill="#0d0b08" />
        <line x1="1000" y1="574" x2="1032" y2="568" />
      </g>

      <g opacity="0.22" fill="#c9a227">
        <circle cx="96" cy="430" r="1.6" />
        <circle cx="282" cy="258" r="1.6" />
        <circle cx="470" cy="158" r="1.6" />
        <circle cx="700" cy="136" r="1.6" />
        <circle cx="942" cy="136" r="1.6" />
        <circle cx="1122" cy="302" r="1.6" />
        <circle cx="862" cy="632" r="1.6" />
        <circle cx="612" cy="622" r="1.6" />
        <circle cx="392" cy="572" r="1.6" />
        <circle cx="172" cy="512" r="1.6" />
      </g>

      <rect width="1200" height="700" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.15" />
    </svg>
  );
}
