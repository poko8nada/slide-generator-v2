export default function SlideViewer({
  containerRef,
  slidesRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  slidesRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className='flex-1 reveal !cursor-auto' ref={containerRef}>
      <div className='slides' ref={slidesRef} />
    </div>
  )
}
