/** Small code-native illustration; no image downloads or animation runtime. */
export function LoveDoodle() {
  return (
    <svg className="kk-love-doodle kk-decorative" viewBox="0 0 120 84" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="74" rx="43" ry="5" fill="#A76478" opacity=".09" />
      <g className="kk-cuddle-left">
        <path d="M25 36C17 18 22 5 29 8C35 10 33 23 35 30C38 16 43 11 47 15C52 20 45 34 43 38" fill="#FFF9EE" stroke="#B48483" strokeWidth="1.6" />
        <path d="M17 53C17 32 49 27 60 46C65 58 60 73 40 74C22 74 16 65 17 53Z" fill="#FFF9EE" stroke="#B48483" strokeWidth="1.6" />
        <g className="kk-doodle-eyes"><circle cx="33" cy="50" r="1.8" fill="#72545F" /><circle cx="46" cy="50" r="1.8" fill="#72545F" /></g>
        <ellipse cx="27" cy="56" rx="5" ry="3" fill="#F4ADBA" opacity=".65" /><ellipse cx="51" cy="56" rx="5" ry="3" fill="#F4ADBA" opacity=".65" />
        <path d="M37 56Q40 60 43 56" stroke="#72545F" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="kk-cuddle-right">
        <circle cx="75" cy="33" r="8" fill="#EDBDAC" stroke="#B48483" strokeWidth="1.6" />
        <circle cx="100" cy="34" r="8" fill="#EDBDAC" stroke="#B48483" strokeWidth="1.6" />
        <path d="M61 53C62 30 103 28 108 52C112 67 101 75 84 74C67 74 58 66 61 53Z" fill="#F6D3BF" stroke="#B48483" strokeWidth="1.6" />
        <g className="kk-doodle-eyes"><circle cx="77" cy="50" r="1.8" fill="#72545F" /><circle cx="91" cy="50" r="1.8" fill="#72545F" /></g>
        <ellipse cx="70" cy="56" rx="5" ry="3" fill="#E799A5" opacity=".6" /><ellipse cx="99" cy="56" rx="5" ry="3" fill="#E799A5" opacity=".6" />
        <path d="M81 56Q84 60 87 56" stroke="#72545F" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <path className="kk-doodle-heart" d="M60 31S47 24 49 17C51 10 59 13 60 17C64 9 73 13 71 20C70 25 60 31 60 31Z" fill="#E889A0" />
      <path d="M52 66Q59 60 64 66" stroke="#B48483" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 29V35M7 32H13M110 15V21M107 18H113" stroke="#DCABB5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
