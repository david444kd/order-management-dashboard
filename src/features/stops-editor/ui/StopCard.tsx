import { useFormContext } from 'react-hook-form'
import { ChevronUp, ChevronDown, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form'
import { cn } from '@/shared/lib/utils'
import type { CreateOrderInput } from '@/shared/zod/orderSchemas'

const STOP_TYPE_LABELS = {
  pick_up: 'Pick Up',
  drop_off: 'Drop Off',
  stop: 'Stop',
}

const APPOINTMENT_TYPE_LABELS = {
  fixed: 'Fixed',
  window: 'Window',
  fcfs: 'FCFS',
}

const STOP_TYPE_COLORS: Record<string, string> = {
  pick_up: 'border-l-green-500',
  drop_off: 'border-l-red-500',
  stop: 'border-l-blue-400',
}

interface StopCardProps {
  index: number
  total: number
  canRemove: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

export function StopCard({ index, total, canRemove, onMoveUp, onMoveDown, onRemove }: StopCardProps) {
  const { control, watch } = useFormContext<CreateOrderInput>()
  const stopType = watch(`stops.${index}.type`)

  return (
    <div
      className={cn(
        'border rounded-lg p-4 border-l-4 bg-card space-y-3',
        STOP_TYPE_COLORS[stopType] ?? 'border-l-border',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <FormField
            control={control}
            name={`stops.${index}.type`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-32 h-7 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STOP_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={index === total - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onRemove}
            disabled={!canRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Address row */}
      <div className="grid grid-cols-12 gap-2">
        <FormField
          control={control}
          name={`stops.${index}.locationName`}
          render={({ field }) => (
            <FormItem className="col-span-12 sm:col-span-6">
              <FormLabel className="text-xs">Location Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chicago Warehouse" className="h-8 text-sm" {...field} value={field.value ?? ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`stops.${index}.refNumber`}
          render={({ field }) => (
            <FormItem className="col-span-12 sm:col-span-6">
              <FormLabel className="text-xs">Ref #</FormLabel>
              <FormControl>
                <Input placeholder="Reference number" className="h-8 text-sm" {...field} value={field.value ?? ''} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`stops.${index}.address.city`}
          render={({ field }) => (
            <FormItem className="col-span-12 sm:col-span-5">
              <FormLabel className="text-xs">City *</FormLabel>
              <FormControl>
                <Input placeholder="City" className="h-8 text-sm" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`stops.${index}.address.state`}
          render={({ field }) => (
            <FormItem className="col-span-5 sm:col-span-3">
              <FormLabel className="text-xs">State *</FormLabel>
              <FormControl>
                <Input placeholder="IL" maxLength={2} className="h-8 text-sm uppercase" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`stops.${index}.address.zip`}
          render={({ field }) => (
            <FormItem className="col-span-7 sm:col-span-4">
              <FormLabel className="text-xs">ZIP *</FormLabel>
              <FormControl>
                <Input placeholder="60601" className="h-8 text-sm" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Appointment row */}
      <div className="grid grid-cols-12 gap-2">
        <FormField
          control={control}
          name={`stops.${index}.appointmentType`}
          render={({ field }) => (
            <FormItem className="col-span-12 sm:col-span-4">
              <FormLabel className="text-xs">Appointment Type *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(APPOINTMENT_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`stops.${index}.appointmentDate`}
          render={({ field }) => (
            <FormItem className="col-span-12 sm:col-span-8">
              <FormLabel className="text-xs">Date & Time *</FormLabel>
              <FormControl>
                <Input type="datetime-local" className="h-8 text-sm" {...field} value={
                  field.value
                    ? (field.value.includes('T') ? field.value.substring(0, 16) : field.value)
                    : ''
                } onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : '')} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Notes */}
      <FormField
        control={control}
        name={`stops.${index}.notes`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Notes</FormLabel>
            <FormControl>
              <Input placeholder="Stop notes..." className="h-8 text-sm" {...field} value={field.value ?? ''} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
