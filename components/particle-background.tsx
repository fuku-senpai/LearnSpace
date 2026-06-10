const defaultParticleCount = 80
const dustParticleCount = 140

const dustMotionClasses = ["particle-dust", "particle-dust particle-dust-b", "particle-dust particle-dust-c"]

const buildParticles = (
  count: number,
  dust: boolean,
) =>
  Array.from({ length: count }, (_, index) => {
    const left = ((index * 13) % 100) + 1
    const top = ((index * 19) % 100) + 1
    const size = dust ? 1.5 + (index % 3) * 0.5 : 2 + (index % 4)
    const opacity = dust
      ? 0.45 + ((index * 5) % 6) * 0.08
      : 0.26 + ((index * 7) % 10) * 0.02
    const duration = dust ? 4 + (index % 7) : 4 + (index % 5)
    const delay = -1 * ((index * 3) % 13)

    return {
      left: `${left}%`,
      top: `${top}%`,
      size,
      opacity,
      duration,
      delay,
      motionClass: dust ? dustMotionClasses[index % dustMotionClasses.length] : "",
    }
  })

const defaultParticles = buildParticles(defaultParticleCount, false)
const dustParticles = buildParticles(dustParticleCount, true)

type ParticleBackgroundProps = {
  variant?: "blue" | "gold";
  dust?: boolean;
};

const ParticleBackground = ({
  variant = "blue",
  dust = false,
}: ParticleBackgroundProps) => {
  const isGold = variant === "gold"
  const particles = dust ? dustParticles : defaultParticles

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="particle-field">
        {particles.map((particle, index) => (
          <span
            key={index}
            className={
              dust
                ? particle.motionClass
                : `particle-dot ${isGold ? "particle-dot-gold" : ""}`
            }
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              opacity: dust ? undefined : particle.opacity,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              animationIterationCount: "infinite",
              animationDirection: "alternate",
              animationTimingFunction: "ease-in-out",
              boxShadow: dust
                ? undefined
                : isGold
                  ? "0 0 8px rgba(251, 191, 36, 0.3)"
                  : "0 0 6px rgba(59, 130, 246, 0.25)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

export { ParticleBackground }
