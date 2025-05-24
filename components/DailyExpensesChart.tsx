"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, LabelList, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useData } from "@/contexts/data-context";
import { formatCurrency } from "@/lib/utils";

export function DailyExpensesChart() {
  const { Expenses, fetchExpenses } = useData();

  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    fetchExpenses();

    // Agrupar despesas por dia
    const grouped = Expenses.reduce<Record<string, number>>((acc, expense) => {
      const day = new Date(expense.creationDate).toLocaleDateString("pt-BR");
      acc[day] = (acc[day] ?? 0) + expense.value;
      return acc;
    }, {});

    // Converter para array ordenado por data
    const dataArr = Object.entries(grouped)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-')); // converte dd/mm/yyyy para yyyy-mm-dd
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });

    setChartData(dataArr);
  }, [Expenses, fetchExpenses]);

  const chartConfig = {
    value: {
      label: "Gastos",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos Diários</CardTitle>
        <CardDescription>Visão diária dos seus gastos</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{ top: 20, left: 12, right: 12, bottom: 20 }}
            width={600}
            height={300}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="value"
              type="natural"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={{ fill: "var(--color-value)" }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => formatCurrency(value)}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Mostrando seus gastos por dia no período carregado
        </div>
      </CardFooter>
    </Card>
  );
}
