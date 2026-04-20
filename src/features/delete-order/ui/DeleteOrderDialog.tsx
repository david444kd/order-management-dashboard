import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { useDeleteOrder } from '@/entities/order'

interface DeleteOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  referenceNumber: string
}

export function DeleteOrderDialog({
  open,
  onOpenChange,
  orderId,
  referenceNumber,
}: DeleteOrderDialogProps) {
  const { mutate: deleteOrder, isPending } = useDeleteOrder()

  const handleConfirm = () => {
    deleteOrder(orderId, {
      onSuccess: () => {
        toast.success(`Order ${referenceNumber} deleted`)
        onOpenChange(false)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{referenceNumber}</strong>? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
