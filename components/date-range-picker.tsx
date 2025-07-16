"use client"

import * as React from "react"
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export type { DateRange }

interface MonthOption {
  value: string;
  label: string;
}

interface DateRangePickerProps {
  // A prop 'date' não é mais necessária, mas mantemos onDateChange
  onDateChange: (date: DateRange) => void
  className?: string
}

export function DateRangePicker({ onDateChange, className }: DateRangePickerProps) {
  
  // Gera dinamicamente as opções de mês
  const monthOptions = React.useMemo(() => {
    const today = new Date();
    const options: MonthOption[] = [
      { value: "thisMonth", label: "Este mês" },
      { value: "nextMonth", label: "Próximo mês" },
      { value: "lastMonth", label: "Mês passado" },
    ];

    // Adiciona os próximos 4 meses (Setembro, Outubro, Novembro, etc.)
    for (let i = 3; i <= 5; i++) {
      const futureMonth = addMonths(today, i - 1);
      const monthLabel = format(futureMonth, 'MMMM', { locale: ptBR });
      options.push({
        value: format(futureMonth, 'yyyy-MM'), // ex: "2025-09"
        // Capitaliza a primeira letra do mês
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      });
    }
    
    options.push({ value: "thisYear", label: "Este ano" });

    return options;
  }, []);
  
  const [selectedValue, setSelectedValue] = useState("thisMonth");

  const handleValueChange = (value: string) => {
    const today = new Date()
    let from: Date
    let to: Date
    
    setSelectedValue(value);

    // Verifica se o valor é um mês específico (ex: "2025-09")
    if (value.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = value.split('-').map(Number);
      from = startOfMonth(new Date(year, month - 1));
      to = endOfMonth(new Date(year, month - 1));
    } else {
      // Lida com os casos fixos
      switch (value) {
        case "thisMonth":
          from = startOfMonth(today);
          to = endOfMonth(today);
          break;
        case "nextMonth":
          const nextMonthDate = addMonths(today, 1);
          from = startOfMonth(nextMonthDate);
          to = endOfMonth(nextMonthDate);
          break;
        case "lastMonth":
          const lastMonthDate = addMonths(today, -1);
          from = startOfMonth(lastMonthDate);
          to = endOfMonth(lastMonthDate);
          break;
        case "thisYear":
          from = new Date(today.getFullYear(), 0, 1);
          to = new Date(today.getFullYear(), 11, 31);
          break;
        default:
          return;
      }
    }

    onDateChange({ from, to });
  }

  // Define o valor inicial para "Este mês" na primeira renderização
  React.useEffect(() => {
    handleValueChange("thisMonth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Selecione um período" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}