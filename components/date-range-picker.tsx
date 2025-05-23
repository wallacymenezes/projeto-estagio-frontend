"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
export type { DateRange }
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  date: DateRange
  onDateChange: (date: DateRange) => void
  className?: string
}

export function DateRangePicker({ date, onDateChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Predefined date ranges
  const handleSelectPredefined = (value: string) => {
    const today = new Date()
    let from: Date
    let to: Date = today

    switch (value) {
      case "today":
        from = today
        break
      case "yesterday": {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        from = yesterday
        to = yesterday
        break
      }
      case "last7days":
        from = new Date()
        from.setDate(from.getDate() - 6)
        break
      case "last30days":
        from = new Date()
        from.setDate(from.getDate() - 29)
        break
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case "lastMonth": {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1)
        from = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
        to = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
        break
      }
      case "thisYear":
        from = new Date(today.getFullYear(), 0, 1)
        to = new Date(today.getFullYear(), 11, 31)
        break
      default:
        return
    }

    onDateChange({ from, to })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal md:w-auto", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Select onValueChange={handleSelectPredefined}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês passado</SelectItem>
                <SelectItem value="thisYear">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(date) => {
              onDateChange(date || { from: new Date(), to: new Date() })
              if (date?.from && date?.to) {
                setIsOpen(false)
              }
            }}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
