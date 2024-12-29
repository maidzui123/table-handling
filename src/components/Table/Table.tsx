import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  VisibilityState,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  FilterFn,
  ColumnFiltersState,
  Header,
} from "@tanstack/react-table";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Person } from "../../types/PersonTypes";
import { defaultData } from "../../constants";
import { RiUnpinFill,  } from "react-icons/ri";
import { RxDrawingPinFilled } from "react-icons/rx";

interface DraggableHeaderProps {
  header: Header<Person, unknown>;
  table: any;
  isPinned: boolean;
  onPin: (columnId: string) => void;
}

// Draggable Header Component
const DraggableHeader = ({ header, isPinned, onPin }: DraggableHeaderProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: header.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <th
      ref={setNodeRef}
      key={header.id}
      className={`border p-2 ${
        isPinned ? "bg-blue-50 font-bold" : "bg-gray-100"
      }`}
      style={style}
      {...attributes}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center cursor-move" {...listeners}>
            ⋮⋮
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
          <button
            onClick={() => onPin(header.column.id)}
            className={`ml-2 text-sm ${
              isPinned ? "text-blue-600" : "text-gray-400"
            }`}
            title={isPinned ? "Unpin" : "Pin"}
          >
            {isPinned ? <RiUnpinFill /> : <RxDrawingPinFilled />}
          </button>
        </div>
        <input
          value={(header.column.getFilterValue() ?? "") as string}
          onChange={(e) => header.column.setFilterValue(e.target.value)}
          placeholder={`Search ${header.column.id}...`}
          className="mt-2 p-1 border rounded text-sm w-full"
        />
      </div>
    </th>
  );
};

const searchFilter: FilterFn<any> = (row, columnId, value) => {
  const itemValue = row.getValue(columnId);
  const itemStr = String(itemValue).toLowerCase();
  const searchStr = String(value).toLowerCase();
  return itemStr.includes(searchStr);
};

const Table = () => {

  // Set up states
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [unpinnedColumns, setUnpinnedColumns] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Define columns for data
  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      { id: "id", accessorKey: "id", header: "ID", filterFn: searchFilter },
      {
        id: "firstName",
        accessorKey: "firstName",
        header: "First Name",
        filterFn: searchFilter,
      },
      {
        id: "lastName",
        accessorKey: "lastName",
        header: "Last Name",
        filterFn: searchFilter,
      },
      { id: "age", accessorKey: "age", header: "Age", filterFn: searchFilter },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        filterFn: searchFilter,
      },
    ],
    []
  );

  // Update unpinned columns when columns or pinned columns change
  useEffect(() => {
    setUnpinnedColumns(
      columns
        .map((col) => col.id as string)
        .filter((id) => !pinnedColumns.includes(id))
    );
  }, [columns, pinnedColumns]);

  // Create Tanstack Table
  const table = useReactTable({
    data: defaultData,
    columns,
    state: {
      columnVisibility,
      columnFilters,
      columnOrder,
      globalFilter,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: { fuzzy: searchFilter },
    globalFilterFn: searchFilter,
  });

  // When Drop Columns
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over?.id as string);

      const newColumnOrder = [...columnOrder];
      newColumnOrder.splice(oldIndex, 1);
      newColumnOrder.splice(newIndex, 0, active.id as string);

      const pinned = newColumnOrder.filter((col) =>
        pinnedColumns.includes(col)
      );
      const unpinned = newColumnOrder.filter(
        (col) => !pinnedColumns.includes(col)
      );

      setColumnOrder([...pinned, ...unpinned]);
    }
  };

  // When Click Pin Button
  const togglePinColumn = (columnId: string) => {
    setPinnedColumns((prev) => {
      let updatedPinnedColumns;
      if (prev.includes(columnId)) {
        // Remove from pinned columns
        updatedPinnedColumns = prev.filter((id) => id !== columnId);
      } else {
        // Add to pinned columns
        updatedPinnedColumns = [...prev, columnId];
      }

      // Update column order
      setColumnOrder([
        ...updatedPinnedColumns, // Pinned columns at the start
        ...unpinnedColumns.filter((id) => !updatedPinnedColumns.includes(id)), // Unpinned columns
      ]);

      return updatedPinnedColumns;
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded w-full"
          placeholder="Search across all columns..."
        />
      </div>
      <div className="mb-4">
        <strong>Toggle Columns: </strong>
        {table.getAllLeafColumns().map((column) => (
          <label key={column.id} className="mr-4">
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />{" "}
            {column.id}
          </label>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableHeader
                        key={header.id}
                        header={header}
                        table={table}
                        isPinned={pinnedColumns.includes(header.column.id)}
                        onPin={togglePinColumn}
                      />
                    ))}
                  </SortableContext>
                </tr>
              ))}
            </thead>
          </DndContext>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1 border rounded"
        >
          Previous
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-1 border rounded"
        >
          Next
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
};

export default Table;
