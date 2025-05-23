"use client";

import { useState, useEffect } from "react";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { CategoriaDialog } from "@/components/categoria-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Plus, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/models/Category";

export default function CategoriasPage() {
  const {
    Categorys: categorias,
    fetchCategorys: fetchCategorias,
    deleteCategory: deleteCategoria,
  } = useData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Category | null>(
    null
  );

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleEdit = (categoria: Category) => {
    setSelectedCategoria(categoria);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategoria(id);
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => row.getValue("description") || "Sem descrição",
    },
    {
      accessorKey: "color",
      header: "Cor",
      cell: ({ row }) => {
        const cor = row.getValue("color") as string;
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cor }} />
            <span>{cor}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const categoria = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(categoria)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta categoria? Esta ação não
                    pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(categoria.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
        <Button
          onClick={() => {
            setSelectedCategoria(null);
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categorias Disponíveis</CardTitle>
          <CardDescription>
            Gerencie as categorias para organizar suas despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {categorias.map((categoria) => (
              <Badge
                key={categoria.id}
                style={{
                  backgroundColor: categoria.color,
                  color: isLightColor(categoria.color || "#ccc") ? "#000" : "#fff",
                }}
                className="px-3 py-1 text-sm"
              >
                {categoria.name}
              </Badge>
            ))}
          </div>
          <DataTable
            columns={columns}
            data={categorias}
            searchColumn="name"
            searchPlaceholder="Filtrar por nome..."
          />
        </CardContent>
      </Card>

      <CategoriaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoria={selectedCategoria}
      />
    </div>
  );
}

// Função para determinar se uma cor é clara ou escura
function isLightColor(color: string) {
  // Converte hex para RGB
  let r, g, b;

  if (color.startsWith("#")) {
    const hex = color.substring(1);
    r = Number.parseInt(hex.substring(0, 2), 16);
    g = Number.parseInt(hex.substring(2, 4), 16);
    b = Number.parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith("rgb")) {
    const rgb = color.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      r = Number.parseInt(rgb[0]);
      g = Number.parseInt(rgb[1]);
      b = Number.parseInt(rgb[2]);
    } else {
      return true;
    }
  } else {
    return true;
  }

  // Calcula a luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Retorna true se a cor for clara
  return luminance > 0.5;
}
