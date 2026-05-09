import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function OddMakiIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#121312",
          borderRadius: "50%",
        }}
      >
        <svg height="28" viewBox="0 0 28 28" width="28">
          <path
            d={describeArc(14, 10.64, 0, 234)}
            fill="none"
            opacity="0.9"
            stroke="#00F0FF"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d={describeArc(14, 10.64, 238, 356)}
            fill="none"
            opacity="0.5"
            stroke="#FF00E5"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}

function describeArc(
  c: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const sa = ((startDeg - 90) * Math.PI) / 180;
  const ea = ((endDeg - 90) * Math.PI) / 180;
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const x1 = (c + r * Math.cos(sa)).toFixed(1);
  const y1 = (c + r * Math.sin(sa)).toFixed(1);
  const x2 = (c + r * Math.cos(ea)).toFixed(1);
  const y2 = (c + r * Math.sin(ea)).toFixed(1);

  return `M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`;
}
