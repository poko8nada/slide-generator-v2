import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export default function SlideSheet({
  children,
  setIsOpen,
}: {
  children?: React.ReactNode
  sheetButton?: React.ReactNode
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <Sheet
      onOpenChange={(open: boolean) => setIsOpen(open)}
      // className='overflow-y-scroll'
    >
      <SheetTrigger asChild>
        <Button variant='default'>Open Sheet</Button>
      </SheetTrigger>
      <SheetContent className='!w-full !max-w-[420px] sm:!max-w-[420px]'>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
        </SheetHeader>
        {children ? (
          children
        ) : (
          <p>Are you sure you want to delete this slide?</p>
        )}
      </SheetContent>
    </Sheet>
  )
}
