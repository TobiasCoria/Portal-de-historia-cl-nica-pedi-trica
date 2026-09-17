export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="blob blob-blue" />
      <div className="blob blob-pink" />
    </div>
  )
}