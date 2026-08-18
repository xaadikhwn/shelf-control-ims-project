/**
 * Export dataset to Excel / CSV file.
 */
export function exportToExcel(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((field) => {
          const str = String(field ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export dataset to Printable / Save to PDF format.
 */
export function exportToPDF(title: string, headers: string[], rows: (string | number)[][]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 24px; color: #111827; }
          .header { margin-bottom: 24px; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; }
          .header h1 { margin: 0 0 6px 0; font-size: 24px; color: #1e3a8a; }
          .header p { margin: 0; font-size: 12px; color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th { background-color: #f3f4f6; text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .footer { margin-top: 32px; font-size: 10px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BizManage BMS — ${title}</h1>
          <p>Exported on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                ${row.map((cell) => `<td>${cell ?? ''}</td>`).join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="footer">
          Confidential Business Record — BizManage Enterprise System
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
