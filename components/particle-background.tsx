const particleCount = 80

const particles = Array.from({ length: particleCount }, (_, index) => {
  const left = ((index * 13) % 100) + 1
  const top = ((index * 19) % 100) + 1
  const size = 2 + (index % 4)
  const opacity = 0.26 + ((index * 7) % 10) * 0.02
  const duration = 4 + (index % 5)
  const delay = -1 * ((index * 3) % 11)

  return {
    left: `${left}%`,
    top: `${top}%`,
    size,
    opacity,
    duration,
    delay,
  }
})

const ParticleBackground = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="particle-field">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="particle-dot"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              animationIterationCount: "infinite",
              animationDirection: "alternate",
              animationFillMode: "both",
              boxShadow: "0 0 6px rgba(59, 130, 246, 0.25)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

export { ParticleBackground }
