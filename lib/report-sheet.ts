export function reportSheet(html: string) {
  return html
    .replace(/<header[^>]*>[\s\S]*?<\/header>/, () =>
      '<header class="report-sheet-nav"><span id="accountName" hidden></span><a href="?sheet=1&amp;view=monthly">گزارش ماهانه</a><a href="?sheet=1">گزارش کلی</a></header>')
    .replace('<form method="get">', '<form method="get"><input type="hidden" name="sheet" value="1">')
    .replace('</head>', '<style>.report-sheet-nav{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;font-size:14px}.report-sheet-nav a{color:#254fe9}</style></head>');
}
