import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, MapPin } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { MAX_STOPS, MIN_STOPS } from '@/shared/config/constants'
import type { CreateOrderInput } from '@/shared/zod/orderSchemas'
import { StopCard } from './StopCard'

export function StopsEditor() {
  const { control, watch, setValue } = useFormContext<CreateOrderInput>()
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'stops',
  })

  const stops = watch('stops')
  const canAdd = fields.length < MAX_STOPS
  const canRemove = fields.length > MIN_STOPS

  const handleMove = (from: number, to: number) => {
    move(from, to)
    // Recalculate order indices after move
    const updated = [...stops]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    updated.forEach((_stop, idx) => {
      setValue(`stops.${idx}.order`, idx, { shouldDirty: true })
    })
  }

  const handleAdd = () => {
    if (!canAdd) return
    append({
      id: `s_${Date.now()}`,
      type: 'stop',
      order: fields.length,
      address: { city: '', state: '', zip: '' },
      locationName: '',
      refNumber: '',
      appointmentType: 'fixed',
      appointmentDate: '',
      notes: '',
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Stops: {fields.length} / {MAX_STOPS}
          </span>
          {stops?.[0]?.appointmentDate && stops?.[fields.length - 1]?.appointmentDate && (
            <span className="text-muted-foreground">· {fields.length} leg route</span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!canAdd}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Stop
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <StopCard
            key={field.id}
            index={index}
            total={fields.length}
            canRemove={canRemove}
            onMoveUp={() => handleMove(index, index - 1)}
            onMoveDown={() => handleMove(index, index + 1)}
            onRemove={() => remove(index)}
          />
        ))}
      </div>
    </div>
  )
}
