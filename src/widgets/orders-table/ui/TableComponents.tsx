import { cn } from '@/shared/lib/utils'

export function TableRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <tr
      className={cn(
        'border-b transition-colors hover:bg-muted/50',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <td className={cn('px-4 py-3 text-sm', className)} onClick={onClick}>
      {children}
    </td>
  )
}

export function TableHead({
  children,
  className,
  onClick,
  sortable,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  sortable?: boolean
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap',
        sortable && 'cursor-pointer hover:text-foreground select-none',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </th>
  )
}
