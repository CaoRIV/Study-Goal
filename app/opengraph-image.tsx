import { ImageResponse } from "next/og";

export const alt =
  "Study Goal - Plan courses, goals, skills, projects, and career preparation";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #FECACA 0%, #F9FAFB 44%, #DDF7F8 100%)",
          color: "#0F172A",
          padding: "72px 80px"
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            right: -80,
            top: -120,
            borderRadius: 999,
            background: "rgba(6, 182, 212, 0.18)"
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            left: 460,
            bottom: -230,
            borderRadius: 999,
            background: "rgba(16, 185, 129, 0.12)"
          }}
        />

        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 60
          }}
        >
          <div
            style={{
              display: "flex",
              width: 690,
              flexDirection: "column"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 28,
                fontWeight: 700,
                color: "#0E7490"
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 48,
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 16,
                  background: "#0891B2",
                  color: "white"
                }}
              >
                S
              </span>
              Study Goal
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 46,
                fontSize: 66,
                lineHeight: 1.04,
                fontWeight: 750,
                letterSpacing: "-0.045em"
              }}
            >
              Turn your university journey into one clear plan.
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                maxWidth: 650,
                fontSize: 25,
                lineHeight: 1.45,
                color: "#334155"
              }}
            >
              Courses, goals, projects, skills, campus activities, portfolios,
              and career preparation for students in every major.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: 300,
              height: 420,
              flexDirection: "column",
              justifyContent: "space-between",
              border: "2px solid rgba(8,145,178,0.22)",
              borderRadius: 36,
              background: "rgba(255,255,255,0.72)",
              padding: 28,
              boxShadow: "0 30px 80px rgba(8,145,178,0.14)"
            }}
          >
            {[
              ["4-year roadmap", "128 credits"],
              ["Skill map", "41 skills"],
              ["Career readiness", "86 / 100"]
            ].map(([label, value], index) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 22,
                  background:
                    index === 1
                      ? "rgba(254,202,202,0.55)"
                      : "rgba(255,251,235,0.9)",
                  padding: "22px 20px"
                }}
              >
                <span style={{ fontSize: 18, color: "#475569" }}>{label}</span>
                <span
                  style={{
                    marginTop: 8,
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#0F172A"
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
