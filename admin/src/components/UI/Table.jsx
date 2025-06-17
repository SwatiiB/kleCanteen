const Table = ({
  columns,
  data = [], // Provide default empty array
  className = '',
  emptyMessage = 'No data available',
  isLoading = false,
  loadingMessage = 'Loading data...',
  onRowClick,
  ...props
}) => {
  // Ensure data is an array to prevent "Cannot read properties of undefined (reading 'length')" error
  const safeData = Array.isArray(data) ? data : [];

  // Debug: Log priority orders for troubleshooting
  if (safeData.length > 0) {
    const priorityOrders = safeData.filter(row =>
      row.priority &&
      row.status !== 'delivered' &&
      row.status !== 'completed' &&
      row.status !== 'cancelled'
    );

    if (priorityOrders.length > 0) {
      console.log('Found priority orders that should be highlighted:', priorityOrders.length);
      console.log('First priority order:', priorityOrders[0]);
    } else {
      console.log('No priority orders to highlight found in data');
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={column.width ? { width: column.width } : {}}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {loadingMessage}
              </td>
            </tr>
          ) : safeData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={
                  row.priority &&
                  row.status !== 'delivered' &&
                  row.status !== 'completed' &&
                  row.status !== 'cancelled'
                    ? {
                        backgroundColor: '#FFEB3B', // Brighter yellow background for priority orders
                        borderLeft: '4px solid #FFC107', // Amber left border
                        fontWeight: '500' // Slightly bolder text
                      }
                    : {}
                }
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {column.cell ? column.cell(row) : (row[column.accessor] ?? 'N/A')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
