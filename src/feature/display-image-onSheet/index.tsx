export default function DisplayImageOnSheet({
  cloudFlareImageIds,
}: {
  cloudFlareImageIds: {
    cloudflareImageId: string
  }[]
}) {
  const imageIds = cloudFlareImageIds.map(imageId => imageId.cloudflareImageId)
  return (
    <div className='grid grid-cols-3 gap-4 p-4 h-6/12 mt-4'>
      {imageIds.map(imageId => (
        <div
          key={imageId}
          className='group flex items-center justify-center p-2 rounded-md aspect-square bg-gray-100 relative overflow-hidden'
        >
          <img
            src={`/api/images/${imageId}`}
            alt={`${imageId}`}
            className='w-full h-full object-contain transition duration-200 group-hover:blur-sm'
          />
          <div className='absolute inset-0 flex flex-col justify-center items-center gap-1 p-1 group-hover:opacity-80 opacity-0 transition-opacity ease-in duration-200 bg-gray-100'>
            <span className='text-gray-800 px-2 py-1 cursor-pointer hover:underline'>
              copy
            </span>
            <span className='text-red-600 px-2 py-1 cursor-pointer hover:underline'>
              delete
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
