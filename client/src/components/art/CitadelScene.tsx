export function CitadelScene() {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A torchlit citadel above a dark sea at dusk">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050508" />
          <stop offset="0.42" stopColor="#120d10" />
          <stop offset="0.68" stopColor="#3a1c14" />
          <stop offset="0.86" stopColor="#6d351b" />
          <stop offset="1" stopColor="#8a451f" />
        </linearGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffdca0" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#e9a75a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#e9a75a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="horizon" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ff9a4d" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff9a4d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#241410" />
          <stop offset="0.5" stopColor="#120d0c" />
          <stop offset="1" stopColor="#080708" />
        </linearGradient>
        <linearGradient id="cliff" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a1513" />
          <stop offset="0.55" stopColor="#0f0c0b" />
          <stop offset="1" stopColor="#060505" />
        </linearGradient>
        <linearGradient id="stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#100d0c" />
          <stop offset="0.5" stopColor="#2a211b" />
          <stop offset="1" stopColor="#0d0a09" />
        </linearGradient>
        <linearGradient id="stoneLit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2b20" />
          <stop offset="1" stopColor="#15100d" />
        </linearGradient>
        <linearGradient id="banner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a32828" />
          <stop offset="0.6" stopColor="#761616" />
          <stop offset="1" stopColor="#4a0d0d" />
        </linearGradient>
        <linearGradient id="vignette" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#050505" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#050505" stopOpacity="0.05" />
          <stop offset="1" stopColor="#050505" stopOpacity="0.55" />
        </linearGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="soft2" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />

      <g opacity="0.85">
        <circle cx="1170" cy="190" r="240" fill="url(#moonGlow)" />
        <circle cx="1170" cy="190" r="46" fill="#f6d7a0" opacity="0.55" />
        <circle cx="1158" cy="182" r="9" fill="#c99a5e" opacity="0.25" />
        <circle cx="1186" cy="204" r="6" fill="#c99a5e" opacity="0.2" />
      </g>

      <ellipse cx="820" cy="360" rx="620" ry="120" fill="#ff8a3d" opacity="0.13" filter="url(#soft)" />
      <ellipse cx="470" cy="250" rx="380" ry="80" fill="#2a1a1a" opacity="0.5" filter="url(#soft)" />
      <ellipse cx="1080" cy="300" rx="420" ry="90" fill="#1e1212" opacity="0.55" filter="url(#soft)" />

      <g fill="#e8d7b8">
        {[
          [120, 90, 1.2], [220, 150, 0.8], [330, 70, 1], [430, 130, 0.7], [520, 60, 1.1],
          [610, 160, 0.8], [700, 90, 0.6], [760, 190, 0.9], [880, 80, 0.7], [960, 140, 1],
          [1040, 70, 0.6], [1300, 100, 0.8], [1400, 170, 0.6], [1500, 80, 0.9], [1560, 220, 0.7],
          [260, 220, 0.6], [560, 240, 0.5], [1240, 260, 0.6],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={0.22 + (i % 4) * 0.12} />
        ))}
      </g>

      <path d="M0 540 L120 430 L210 470 L300 400 L380 450 L470 390 L560 460 L640 430 L720 480 L820 440 L900 500 L1000 470 L1080 510 L1160 480 L1260 520 L1360 490 L1460 530 L1600 500 L1600 900 L0 900 Z" fill="#0d0a0b" opacity="0.9" />
      <path d="M0 600 L90 540 L180 575 L280 520 L360 560 L450 520 L540 570 L640 540 L730 590 L830 550 L930 600 L1040 565 L1140 610 L1240 575 L1350 620 L1460 585 L1600 625 L1600 900 L0 900 Z" fill="#080607" opacity="0.95" />

      <rect y="610" width="1600" height="290" fill="url(#sea)" />
      <ellipse cx="520" cy="700" rx="620" ry="130" fill="url(#horizon)" opacity="0.5" />
      <g stroke="#e89a58" strokeWidth="1" opacity="0.16">
        <path d="M120 660 H360" />
        <path d="M80 700 H300" />
        <path d="M180 740 H430" />
        <path d="M40 780 H260" />
        <path d="M240 820 H520" />
        <path d="M400 860 H700" />
      </g>
      <g stroke="#d9854a" strokeWidth="0.8" opacity="0.1">
        <path d="M760 690 H980" />
        <path d="M700 730 H900" />
        <path d="M820 770 H1040" />
      </g>

      <path d="M760 900 L820 700 L900 610 L1010 570 L1120 560 L1250 545 L1380 560 L1500 545 L1600 560 L1600 900 Z" fill="url(#cliff)" />
      <path d="M900 610 L960 640 L1030 590 L1110 610 L1180 570 L1260 600 L1340 570 L1420 610 L1500 585 L1600 620 L1600 900 L900 900 Z" fill="#0a0808" opacity="0.65" />

      <g opacity="0.9">
        <path d="M760 900 L830 720 L910 650 L900 900 Z" fill="#070606" />
        <path d="M1380 900 L1360 640 L1460 600 L1600 630 L1600 900 Z" fill="#070606" />
      </g>

      <g>
        <ellipse cx="1210" cy="540" rx="300" ry="80" fill="#ff9a4d" opacity="0.12" filter="url(#soft)" />

        <g>
          <rect x="1080" y="330" width="190" height="230" fill="url(#stone)" />
          <rect x="1080" y="330" width="190" height="8" fill="#3b2c21" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={1084 + i * 23} y="316" width="13" height="16" fill="#2b211a" />
          ))}
          <rect x="1136" y="180" width="60" height="160" fill="url(#stoneLit)" />
          <path d="M1128 182 L1166 96 L1204 182 Z" fill="#191310" />
          <path d="M1128 182 L1166 96 L1204 182" fill="none" stroke="#3b2b1e" strokeWidth="1.2" />
          <line x1="1166" y1="96" x2="1166" y2="60" stroke="#3b2b1e" strokeWidth="2" />
          <path d="M1166 60 L1194 68 L1166 78 Z" fill="url(#banner)" />
        </g>

        <g>
          <rect x="960" y="360" width="120" height="200" fill="url(#stone)" />
          <path d="M950 362 L1020 280 L1090 362 Z" fill="#171210" />
          <path d="M950 362 L1020 280 L1090 362" fill="none" stroke="#3a2a1e" strokeWidth="1" />
          <line x1="1020" y1="280" x2="1020" y2="248" stroke="#3a2a1e" strokeWidth="2" />
          <path d="M1020 248 L1050 256 L1020 268 Z" fill="url(#banner)" />
          <rect x="974" y="392" width="16" height="26" fill="#f0b86a" filter="url(#glow)" opacity="0.85" />
          <rect x="1012" y="392" width="16" height="26" fill="#f0b86a" filter="url(#glow)" opacity="0.7" />
          <rect x="974" y="452" width="16" height="26" fill="#f0b86a" filter="url(#glow)" opacity="0.55" />
          <rect x="1012" y="452" width="16" height="26" fill="#f0b86a" filter="url(#glow)" opacity="0.8" />
        </g>

        <g>
          <rect x="1268" y="376" width="110" height="184" fill="url(#stone)" />
          <path d="M1260 378 L1323 300 L1386 378 Z" fill="#171210" />
          <path d="M1260 378 L1323 300 L1386 378" fill="none" stroke="#3a2a1e" strokeWidth="1" />
          <rect x="1284" y="410" width="14" height="24" fill="#f0b86a" filter="url(#glow)" opacity="0.75" />
          <rect x="1318" y="410" width="14" height="24" fill="#f0b86a" filter="url(#glow)" opacity="0.6" />
          <rect x="1284" y="468" width="14" height="24" fill="#f0b86a" filter="url(#glow)" opacity="0.5" />
          <rect x="1318" y="468" width="14" height="24" fill="#f0b86a" filter="url(#glow)" opacity="0.8" />
          <path d="M1330 378 L1330 470 L1368 470 L1352 424 L1368 378 Z" fill="url(#banner)" opacity="0.9" />
        </g>

        <g>
          <rect x="1396" y="432" width="86" height="128" fill="url(#stone)" />
          <path d="M1390 434 L1439 376 L1488 434 Z" fill="#15100e" />
          <rect x="1410" y="458" width="12" height="20" fill="#f0b86a" filter="url(#glow)" opacity="0.65" />
          <rect x="1442" y="458" width="12" height="20" fill="#f0b86a" filter="url(#glow)" opacity="0.5" />
        </g>

        <g>
          <rect x="1100" y="392" width="16" height="26" fill="#f5c47c" filter="url(#glow)" opacity="0.9" />
          <rect x="1140" y="392" width="16" height="26" fill="#f5c47c" filter="url(#glow)" opacity="0.65" />
          <rect x="1180" y="392" width="16" height="26" fill="#f5c47c" filter="url(#glow)" opacity="0.8" />
          <rect x="1100" y="452" width="16" height="26" fill="#f5c47c" filter="url(#glow)" opacity="0.55" />
          <rect x="1140" y="452" width="16" height="26" fill="#f5c47c" filter="url(#glow)" opacity="0.75" />
          <rect x="1180" y="452" width="16" height="26" fill="#f5c47c" filter="url(#glow)" opacity="0.5" />
          <rect x="1100" y="512" width="16" height="26" fill="#f5c47c" filter="url(#glow)" opacity="0.6" />
          <rect x="1180" y="512" width="16" height="26" fill="#f5c47c" filter="url(#glow)" opacity="0.7" />
        </g>

        <path d="M1120 560 L1120 500 Q1175 462 1230 500 L1230 560 Z" fill="#0a0807" />
        <path d="M1120 500 Q1175 462 1230 500" fill="none" stroke="#5a4026" strokeWidth="2" />
        <rect x="1158" y="500" width="34" height="60" fill="#f0a85c" opacity="0.22" filter="url(#soft2)" />
        <rect x="1164" y="508" width="22" height="52" fill="#1a110a" />
        <path d="M1164 508 Q1175 494 1186 508" fill="none" stroke="#6b4a28" strokeWidth="1.4" />

        <g>
          <rect x="1150" y="286" width="30" height="44" fill="url(#banner)" />
          <path d="M1150 330 L1165 318 L1180 330 L1180 286 L1150 286 Z" fill="url(#banner)" />
          <circle cx="1165" cy="306" r="5" fill="none" stroke="#e3c274" strokeWidth="1" opacity="0.7" />
        </g>

        <g opacity="0.9">
          <path d="M850 560 Q900 520 960 540 L960 560 L850 560 Z" fill="#0c0908" />
          <path d="M860 560 Q910 532 960 548" fill="none" stroke="#5a4026" strokeWidth="2" />
          <path d="M880 560 L900 540 M920 560 L940 544" stroke="#0c0908" strokeWidth="4" />
          <rect x="850" y="556" width="112" height="6" fill="#100c0a" />
        </g>
      </g>

      <g fill="#050505">
        <path d="M60 900 L90 800 L120 900 Z" />
        <path d="M110 900 L150 770 L190 900 Z" />
        <path d="M170 900 L210 810 L250 900 Z" />
        <path d="M1450 900 L1490 790 L1530 900 Z" />
        <path d="M1520 900 L1560 820 L1600 900 Z" />
      </g>
      <path d="M0 900 L0 840 Q160 800 320 850 T640 860 T960 880 T1280 850 T1600 880 L1600 900 Z" fill="#050404" />

      <g stroke="#0a0908" strokeWidth="3" fill="none" opacity="0.9">
        <path className="raven-drift" d="M520 300 q14 -10 28 0 q14 10 28 0" />
        <path className="raven-drift raven-b" d="M600 250 q10 -7 20 0 q10 7 20 0" />
        <path className="raven-drift raven-c" d="M440 220 q9 -6 18 0 q9 6 18 0" />
        <path className="raven-drift raven-d" d="M680 330 q8 -5 16 0 q8 5 16 0" />
      </g>

      <g>
        {[
          [980, 600, 3], [1030, 660, 2.2], [1180, 620, 2.6], [1240, 700, 2], [1330, 640, 2.4],
          [900, 720, 1.8], [1420, 690, 2.2], [1100, 740, 1.6], [1280, 760, 1.8], [1520, 700, 2],
        ].map(([cx, cy, r], i) => (
          <circle
            key={i}
            className="ember-particle"
            cx={cx}
            cy={cy}
            r={r}
            fill={i % 3 === 0 ? "#ffd28a" : "#f08a3c"}
            opacity="0.7"
            style={{ animationDelay: `${i * 0.7}s`, animationDuration: `${5 + (i % 4)}s` }}
          />
        ))}
      </g>

      <rect width="1600" height="900" fill="url(#vignette)" opacity="0.7" />
    </svg>
  );
}
