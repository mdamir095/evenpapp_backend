import { InputGroup } from "./InputGroup";

type Column = { key: string; label: string };

interface ColumnFilterDropdownProps {
  columns: Column[];
  visibleCols: string[];
  setVisibleCols: (cols: string[]) => void;
}

export default function ColumnFilterDropdown({
  columns,
  visibleCols,
  setVisibleCols,
}: ColumnFilterDropdownProps) {
  const handleToggle = (key: string) => {
    if (visibleCols.includes(key)) {
      setVisibleCols(visibleCols.filter((k: string) => k !== key));
    } else {
      setVisibleCols([...visibleCols, key]);
    }
  };

  return (
    <div className="absolute bg-white border rounded shadow p-4 w-64 z-10">
      <h3 className="text-sm font-semibold mb-3">Toggle Columns</h3>
      {columns.map(col => (
        <div key={col.key} className="flex items-center space-x-2 mb-2">
          <InputGroup
            type="checkbox"
            checked={visibleCols.includes(col.key)}
            onChange={() => handleToggle(col.key)}
            className="accent-vendor rounded-xl"
            name={col.label}
          />
          <span className="text-sm">{col.label}</span>
        </div>
      ))}
    </div>
  );
}
