=[System.Text.Encoding]::GetEncoding('iso-8859-1')
=.GetString([System.IO.File]::ReadAllBytes('public_html/js/dashboard.js'))
="  const formatInvoiceMoney = (value) => {
    const meta = getCurrencyMeta(invoiceDraft?.currencyCode);
    const num = Number.isFinite(Number(value)) ? Number(value) : 0;
    return ;
  };
"
="  const formatInvoiceMoney = (value) => {
    const meta = getCurrencyMeta(invoiceDraft?.currencyCode);
    const num = Number.isFinite(Number(value)) ? Number(value) : 0;
    return ${meta.symbol};
  };
"
if(-not .Contains()){throw 'old block not found'}
=.Replace(,)
[System.IO.File]::WriteAllBytes('public_html/js/dashboard.js',.GetBytes())
