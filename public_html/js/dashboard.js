document.addEventListener('DOMContentLoaded', async () => {
  if (!window.MostycomAuth) {
    console.error('Auth module tidak ditemukan');
    return;
  }

  const authResult = await MostycomAuth.requireAuth();
  if (!authResult) {
    return;
  }
  const user = authResult.user || MostycomAuth.getUser();
  const heroUserNode = document.getElementById('hero-user-name');
  const headerUserNameNode = document.getElementById('header-user-name');
  const headerUserRoleNode = document.getElementById('header-user-role');
  const sidebarUserNameNode = document.getElementById('sidebar-user-name');
  const sidebarUserRoleNode = document.getElementById('sidebar-user-role');
  const logoutButtons = document.querySelectorAll('[data-action="logout"]');
  const sectionLinks = document.querySelectorAll('[data-section-link]');
  const sections = document.querySelectorAll('[data-section]');
  const overviewTripCountNode = document.getElementById('overview-trip-count');
  const overviewArticleCountNode = document.getElementById('overview-article-count');
  const tripImagePreview = document.getElementById('trip-image-preview');
  const articleImagePreview = document.getElementById('article-image-preview');
  const tripImageInput = document.getElementById('trip-image-input');
  const tripPhotosContainer = document.getElementById('trip-photos-list');
  const tripPhotosEmptyState = document.getElementById('trip-photos-empty');
  const articleImageInput = document.getElementById('article-image-input');
  const tripForm = document.getElementById('trip-form');
  const articleForm = document.getElementById('article-form');
  const tripSaveBtn = document.getElementById('trip-save-btn');
  const tripCancelBtn = document.getElementById('trip-cancel-btn');
  const tripRoutesContainer = document.getElementById('trip-routes-container');
  const tripRouteAddBtn = document.getElementById('trip-route-add-btn');
  const tripRouteEmptyState = document.getElementById('trip-route-empty');
  const articleSaveBtn = document.getElementById('article-save-btn');
  const articleCancelBtn = document.getElementById('article-cancel-btn');
  const invoiceForm = document.getElementById('invoice-form');
  const invoiceItemsContainer = document.getElementById('invoice-items');
  const invoiceItemsEmptyState = document.getElementById('invoice-items-empty');
  const invoiceAddItemBtn = document.getElementById('invoice-add-item');
  const invoiceGenerateBtn = document.getElementById('invoice-generate-btn');
  const invoiceResetBtn = document.getElementById('invoice-reset-btn');
  const invoiceFormStatus = document.getElementById('invoice-form-status');
  const invoicePreviewNode = document.getElementById('invoice-preview');
  const invoicePreviewNumber = document.getElementById('invoice-preview-number');
  const invoicePreviewIssue = document.getElementById('invoice-preview-issue');
  const invoicePreviewDue = document.getElementById('invoice-preview-due');
  const invoicePreviewClient = document.getElementById('invoice-preview-client');
  const invoicePreviewContact = document.getElementById('invoice-preview-contact');
  const invoicePreviewTrip = document.getElementById('invoice-preview-trip');
  const invoicePreviewPayment = document.getElementById('invoice-preview-payment');
  const invoicePreviewNotes = document.getElementById('invoice-preview-notes');
  const invoiceCurrencySelect = document.getElementById('invoice-currency');
  const invoicePreviewItems = document.getElementById('invoice-preview-items');
  const invoicePreviewSubtotal = document.getElementById('invoice-preview-subtotal');
  const invoicePreviewTax = document.getElementById('invoice-preview-tax');
  const invoicePreviewTotal = document.getElementById('invoice-preview-total');
  const invoicePreviewStatus = document.getElementById('invoice-preview-status');
  const invoicePrintBtn = document.getElementById('invoice-print-btn');
  const invoicePdfBtn = document.getElementById('invoice-pdf-btn');
  const invoiceDownloadBtn = document.getElementById('invoice-download-btn');
  const invoiceTypeSelect = document.getElementById('invoice-type');
  const invoiceFromInput = invoiceForm ? invoiceForm.querySelector('[name="invoice-from"]') : null;
  const invoiceTotalUsdInput = document.getElementById('invoice-total-usd');
  const invoiceFxRateInput = document.getElementById('invoice-fx-rate');
  const invoiceFxRateJpyInput = document.getElementById('invoice-fx-rate-jpy');
  const invoiceFxRateJpyLabel = document.querySelector('label[for="invoice-fx-rate-jpy"]');
  const invoiceRateUsdInput = document.getElementById('invoice-rate-usd');
  if (invoiceFxRateJpyLabel) {
    invoiceFxRateJpyLabel.textContent = 'IDR per JPY';
  }
  const invoiceTotalIdrInput = document.getElementById('invoice-total-idr');
  const invoiceTotalJpyInput = document.getElementById('invoice-total-jpy');
  const invoiceFetchRateBtn = document.getElementById('invoice-fetch-rate'); // removed from UI, kept for backward compatibility
  const invoiceFxTitleNode = document.querySelector('[data-invoice-fx-title]');
  const invoiceFxTotalLabelNode = document.querySelector('[data-invoice-fx-total-label]');
  const invoiceFxRateLabelNode = document.querySelector('[data-invoice-fx-rate-label]');
  const invoiceFxConvertedLabelNode = document.querySelector('[data-invoice-fx-converted-label]');
  const invoiceFxHelperNode = document.querySelector('[data-invoice-fx-helper]');
  const invoiceDpToggle = document.getElementById('invoice-dp-toggle');
  const invoiceDpAmountInput = document.getElementById('invoice-dp-amount');
  const invoiceDpInputGroup = document.getElementById('invoice-dp-input-group');

  const nameValue = user?.name || 'User';
  const roleValue = user?.role || 'CMS Manager';
  [heroUserNode, headerUserNameNode, sidebarUserNameNode].forEach((node) => {
    if (node) node.textContent = nameValue;
  });
  [headerUserRoleNode, sidebarUserRoleNode].forEach((node) => {
    if (node) node.textContent = roleValue;
  });

  logoutButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      await MostycomAuth.logout();
      window.location.href = 'login.html';
    });
  });

  const setActiveSection = (targetSection) => {
    if (!targetSection) return;
    sections.forEach((section) => {
      const isActive = section.dataset.section === targetSection;
      section.classList.toggle('hidden', !isActive);
    });

    sectionLinks.forEach((link) => {
      const isActive = link.dataset.sectionLink === targetSection;
      const navType = link.dataset.nav || 'desktop';
      if (navType === 'desktop') {
        link.classList.toggle('bg-white', isActive);
        link.classList.toggle('text-slate-900', isActive);
        link.classList.toggle('shadow-lg', isActive);
        link.classList.toggle('text-slate-300', !isActive);
      } else {
        link.classList.toggle('bg-slate-900', isActive);
        link.classList.toggle('text-white', isActive);
        link.classList.toggle('bg-slate-100', !isActive);
        link.classList.toggle('text-slate-600', !isActive);
      }
    });
  };

  sectionLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setActiveSection(link.dataset.sectionLink);
    });
  });

  setActiveSection('overview');

  const API_BASE_URL = window.LOGIN_API_BASE_URL || '/backend/api';
  const TRIP_API_INDEX = `${API_BASE_URL}/trips/index.php`;
  const TRIP_API_ITEM = `${API_BASE_URL}/trips/item.php`;
  const ARTICLE_API_INDEX = `${API_BASE_URL}/articles/index.php`;
  const ARTICLE_API_ITEM = `${API_BASE_URL}/articles/item.php`;
  const TESTIMONIAL_API_INDEX = `${API_BASE_URL}/testimonials/index.php`;
  const TESTIMONIAL_API_ITEM = `${API_BASE_URL}/testimonials/item.php`;
  const FAQ_API_INDEX = `${API_BASE_URL}/faqs/index.php`;
  const FAQ_API_ITEM = `${API_BASE_URL}/faqs/item.php`;
  const CUSTOMER_TRIP_API_INDEX = `${API_BASE_URL}/customer-trips/index.php`;
  const CUSTOMER_TRIP_API_ITEM = `${API_BASE_URL}/customer-trips/item.php`;
  const CONTACT_API_URL = `${API_BASE_URL}/contact/index.php`;
  const USER_API_INDEX = `${API_BASE_URL}/users/index.php`;
  const USER_API_ITEM = `${API_BASE_URL}/users/item.php`;
  const TRIP_PLACEHOLDER = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80';
  const ARTICLE_PLACEHOLDER = 'https://images.unsplash.com/photo-1500534627634-84ae356eb3b3?auto=format&fit=crop&w=600&q=80';
  const CONTACT_HEADER_PLACEHOLDER = 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80';
  const TESTIMONIAL_IMAGE_PLACEHOLDER = 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80';
  const DEFAULT_USER_ROLE = 'CMS User';
  const CUSTOMER_TRIP_STATUS_LABELS = {
    pending: 'Pending',
    booked: 'Booked',
    confirmed: 'Confirmed',
    ongoing: 'On Trip',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  const CUSTOMER_TRIP_STATUS_CLASSES = {
    pending: 'bg-amber-100 text-amber-700',
    booked: 'bg-sky-100 text-sky-600',
    confirmed: 'bg-emerald-100 text-emerald-700',
    ongoing: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600'
  };
  const ROUTE_SCHEDULE_STATUS_OPTIONS = [
    { value: 'open', label: 'Tersedia' },
    { value: 'full', label: 'Penuh' },
    { value: 'waitlist', label: 'Waitlist' },
    { value: 'closed', label: 'Ditutup' }
  ];

  const defaultContact = {
    id: null,
    title: 'Hubungi & Kunjungi MOSTYCOM HQ',
    description: 'Kami berada di Jl. Panglima Polim No. 88, Jakarta Selatan. Silakan datang untuk konsultasi trip atau sesi private planning.',
    hours: 'Senin - Jumat: 09.00 - 18.00 WIB\nSabtu: 10.00 - 15.00 WIB',
    email: 'hello@travelerx.id',
    phone: '+62 812-3456-7890',
    whatsapp: '+62 811-0000-000',
    address: 'Jl. Panglima Polim No. 88, Jakarta Selatan',
    lat: '-6.244822',
    lng: '106.798363',
    vision: 'Menjadi travel partner paling dipercaya.',
    mission: 'Menghadirkan layanan private trip yang detail dan humanis.',
    trust_score: '4.9/5 dari 1.200 traveler',
    review: '"MOSTYCOM bikin persiapan trip kami jadi effortless!"',
    about: 'Sejak 2012, MOSTYCOM membantu ribuan explorer mengunjungi lebih dari 65 negara. Kami mengkurasi pengalaman autentik, akomodasi premium, dan tim lokal terpercaya.',
    about_title: 'MOSTYCOM - Your Global Trip Planner',
    header_image: '',
    header_image_url: CONTACT_HEADER_PLACEHOLDER,
    trust_image: '',
    trust_image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=200&q=80'
  };

  const INVOICE_CURRENCIES = {
    IDR: { label: 'Rupiah', symbol: 'Rp', currency: 'IDR', locale: 'id-ID', fractionDigits: 0 },
    USD: { label: 'US Dollar', symbol: '$', currency: 'USD', locale: 'en-US', fractionDigits: 2 },
    JPY: { label: 'Yen', symbol: '¥', currency: 'JPY', locale: 'ja-JP', fractionDigits: 0 }
  };
  const invoiceCurrencyFormatterCache = {};
  const normalizeInvoiceCurrencyCode = (code) => {
    const normalized = (code || '').toString().trim().toUpperCase();
    return INVOICE_CURRENCIES[normalized] ? normalized : 'IDR';
  };
  const getInvoiceCurrencyConfig = (code) => INVOICE_CURRENCIES[normalizeInvoiceCurrencyCode(code)];
  const formatInvoiceCurrency = (value, code) => {
    const config = getInvoiceCurrencyConfig(code);
    const cacheKey = `${config.locale}-${config.currency}-${config.fractionDigits}`;
    if (!invoiceCurrencyFormatterCache[cacheKey]) {
      invoiceCurrencyFormatterCache[cacheKey] = new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: config.fractionDigits,
        maximumFractionDigits: config.fractionDigits
      });
    }
    const formatter = invoiceCurrencyFormatterCache[cacheKey];
    return formatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);
  };

  const INVOICE_TYPES = {
    QUOTATION: 'Quotation',
    BILLING: 'Billing',
    PAYMENT: 'Payment'
  };
  const getInvoiceTypeLabel = (type) => INVOICE_TYPES[type] || INVOICE_TYPES.BILLING;
  const getInvoiceFxContext = () => {
    const baseCurrency = normalizeInvoiceCurrencyCode(invoiceDraft?.currencyCode);
    const baseLabel = getInvoiceCurrencyConfig(baseCurrency).currency;
    return {
      baseCurrency,
      labels: {
        title: `Kurs & Total ${baseLabel}`,
        totalBase: 'Total USD',
        totalConverted: baseCurrency === 'USD' ? 'Total IDR' : `Total ${baseLabel}`,
        totalUsd: 'Total USD',
        rate: baseCurrency === 'JPY' ? 'Kurs Yen' : 'Kurs IDR'
      }
    };
  };
  const updateInvoiceCurrencyUi = () => {
    const fxContext = getInvoiceFxContext();
    if (invoiceFxTitleNode) invoiceFxTitleNode.textContent = fxContext.labels.title;
    if (invoiceFxTotalLabelNode) invoiceFxTotalLabelNode.textContent = fxContext.labels.totalBase;
    if (invoiceFxRateLabelNode) invoiceFxRateLabelNode.textContent = fxContext.labels.rate;
    if (invoiceFxConvertedLabelNode) invoiceFxConvertedLabelNode.textContent = fxContext.labels.totalConverted;
    if (invoiceFxHelperNode) {
      invoiceFxHelperNode.textContent = '';
    }
  };

  let trips = [];
  let articles = [];
  let testimonials = [];
  let faqs = [];
  let customerTrips = [];
  const customerTripFilters = {
    nama: '',
    kode_booking: '',
    status: ''
  };
  let contact = { ...defaultContact };
  let users = [];
  let editingTripId = null;
  let editingArticleId = null;
  let editingTestimonialId = null;
  let testimonialImageDataUrl = null;
  let editingCustomerTripId = null;
  let editingFaqId = null;
  let editingUserId = null;
  let tripPhotosDraft = [];
  let articleImageDataUrl = null;
  let contactHeaderImageDataUrl = null;
  let contactTrustImageDataUrl = null;
  let tripRouteDrafts = [];
  let invoiceDraft = null;

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });

  const escapeHtml = (value) => {
    if (value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const normalizeInputValue = (value) => (value === null || value === undefined ? '' : String(value));

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number.isFinite(Number(value)) ? Number(value) : 0);

  const formatInvoiceMoney = (value) => formatInvoiceCurrency(value, invoiceDraft?.currencyCode);

  const formatDateOnly = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatDateInputValue = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseMoneyInput = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const fetchUsdRates = async () => {
    const urls = [
      'https://open.er-api.com/v6/latest/USD',
      'https://api.exchangerate.host/latest?base=USD&symbols=IDR,JPY'
    ];
    for (const url of urls) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        const rates = data?.rates || data?.result;
        const idr = parseMoneyInput(rates?.IDR || rates?.idr);
        const jpy = parseMoneyInput(rates?.JPY || rates?.jpy);
        if (idr > 0 && jpy > 0) {
          const idrPerJpy = jpy > 0 ? idr / jpy : DEFAULT_IDR_PER_JPY_RATE;
          return { idr, idrPerJpy };
        }
        if (idr > 0) {
          return { idr, idrPerJpy: DEFAULT_IDR_PER_JPY_RATE };
        }
      } catch (error) {
        console.warn('Gagal mengambil kurs dari', url, error);
      }
    }
    throw new Error('Kurs USD/IDR/JPY tidak tersedia.');
  };

  const createEmptyInvoiceItem = (description = '', qty = 1, price = 0) => ({
    description,
    qty: Number.isFinite(Number(qty)) ? Number(qty) : 1,
    price: Number.isFinite(Number(price)) ? Number(price) : 0
  });

  const DEFAULT_USD_IDR_RATE = 15500;
  const DEFAULT_USD_JPY_RATE = 150;
  const DEFAULT_IDR_PER_JPY_RATE = Number((DEFAULT_USD_IDR_RATE / DEFAULT_USD_JPY_RATE).toFixed(4));

  const getDefaultInvoiceDraft = () => {
    const today = new Date();
    return {
      number: `INV-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-001`,
      issueDate: formatDateInputValue(today),
      client: 'Nama Client',
      notes: [
        'BNI',
        '7724472443',
        'A/n MABARAKKA MOSLEM MODESTY PT',
        '',
      ].join('\n'),
      currencySymbol: INVOICE_CURRENCIES.IDR.symbol,
      currencyCode: 'IDR',
      type: 'BILLING',
      fromName: ['Asti Nurrahmadani Safri Sappe', '(PT MABARAKKA MOSLEM MODESTY)'].join('\n'),
      fromCompany: '',
      paymentFootnote: '*Kurs akan diupdate saat hari pembayaran',
      dpEnabled: false,
      dpAmount: 0,
      totalUsd: 0,
      fxRate: DEFAULT_USD_IDR_RATE,
      fxRateJpy: DEFAULT_IDR_PER_JPY_RATE,
      totalIdr: 0,
      manualTotalUsd: 0,
      manualTotalIdr: 0,
      manualTotalJpy: 0,
      items: [
        createEmptyInvoiceItem('Down Payment', 1, 0)
      ]
    };
  };

  const syncInvoiceDpUi = () => {
    if (invoiceDpToggle) {
      invoiceDpToggle.checked = Boolean(invoiceDraft.dpEnabled);
    }
    if (invoiceDpInputGroup) {
      invoiceDpInputGroup.classList.toggle('hidden', !invoiceDraft.dpEnabled);
    }
    if (invoiceDpAmountInput) {
      invoiceDpAmountInput.disabled = !invoiceDraft.dpEnabled;
      if (invoiceDraft.dpEnabled) {
        invoiceDpAmountInput.value = normalizeInputValue(invoiceDraft.dpAmount || 0);
      } else {
        invoiceDpAmountInput.value = '';
      }
    }
  };

  invoiceDraft = getDefaultInvoiceDraft();
  syncInvoiceDpUi();

  const getInvoiceDownloadName = () => {
    const raw = invoiceDraft?.number || 'invoice-mostycom';
    return raw.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'invoice-mostycom';
  };

  const updateDerivedFxTotals = (totals) => {
    const invoiceTotal = totals?.total || 0;
    const dpAmount = totals?.dpAmount || 0;
    const fxRateValue = parseMoneyInput(invoiceDraft.fxRate);
    const currencyCode = normalizeInvoiceCurrencyCode(invoiceDraft.currencyCode);
    invoiceDraft.currencyCode = currencyCode;
    let convertedDp = dpAmount;
    if (currencyCode === 'USD') {
      invoiceDraft.totalUsd = invoiceTotal;
      invoiceDraft.totalIdr = fxRateValue > 0 ? Math.round(invoiceTotal * fxRateValue) : 0;
      convertedDp = fxRateValue > 0 ? Math.round(dpAmount * fxRateValue) : dpAmount;
    } else {
      invoiceDraft.totalIdr = invoiceTotal;
      invoiceDraft.totalUsd = fxRateValue > 0 ? Number((invoiceTotal / fxRateValue).toFixed(2)) : 0;
      convertedDp = dpAmount;
    }
    if (invoiceTotalUsdInput) invoiceTotalUsdInput.value = normalizeInputValue(invoiceDraft.totalUsd);
    if (invoiceTotalIdrInput) invoiceTotalIdrInput.value = normalizeInputValue(invoiceDraft.totalIdr);
    invoiceDraft.dpConverted = convertedDp;
    return { convertedDp, fxRateValue };
  };

  const getFxRateSnapshot = (overrides = {}) => {
    const usdIdrCandidate = (() => {
      if (typeof overrides.usdIdr === 'number' && overrides.usdIdr > 0) {
        return overrides.usdIdr;
      }
      const candidate = parseMoneyInput(invoiceDraft.fxRate);
      return candidate > 0 ? candidate : DEFAULT_USD_IDR_RATE;
    })();

    const idrPerJpyCandidate = (() => {
      const candidate = parseMoneyInput(invoiceDraft.fxRateJpy);
      return candidate > 0 ? candidate : DEFAULT_IDR_PER_JPY_RATE;
    })();

    const jpyPerUsd = usdIdrCandidate > 0 && idrPerJpyCandidate > 0
      ? usdIdrCandidate / idrPerJpyCandidate
      : 0;

    return {
      usdIdr: usdIdrCandidate,
      idrPerJpy: idrPerJpyCandidate,
      jpyPerUsd
    };
  };

  const createEmptyRouteDraft = () => ({
    nama_rute: '',
    deskripsi_rute: '',
    durasi: '',
    harga: '',
    kapasitas: '',
    slot_tersedia: '',
    schedules: []
  });

  const createEmptyScheduleDraft = () => ({
    tanggal_mulai: '',
    tanggal_selesai: '',
    kuota: '',
    slot_tersedia: '',
    status: 'open'
  });

  const generatePhotoTempId = () => `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const createPhotoDraft = (photo = {}, index = 0) => ({
    id: typeof photo.id === 'number' ? photo.id : (photo.id ? Number(photo.id) : null),
    tempId: photo.tempId || generatePhotoTempId(),
    photo_url: photo.photo_url || photo.photoUrl || null,
    photo_full_url: photo.photo_full_url || photo.photoFullUrl || photo.photo_url || null,
    preview_url: photo.preview_url || null,
    image_base64: photo.image_base64 || null,
    is_primary: Boolean(photo.is_primary),
    sort_order: Number.isFinite(Number(photo.sort_order)) ? Number(photo.sort_order) : index + 1
  });

  const getPhotoPreviewSrc = (photo) => photo.preview_url || photo.photo_full_url || photo.photo_url || TRIP_PLACEHOLDER;

  const ensureTripPhotoPrimary = () => {
    if (!tripPhotosDraft.length) return;
    let hasPrimary = false;
    tripPhotosDraft.forEach((photo) => {
      if (photo.is_primary && !hasPrimary) {
        hasPrimary = true;
        photo.is_primary = true;
      } else {
        photo.is_primary = false;
      }
    });
    if (!hasPrimary && tripPhotosDraft[0]) {
      tripPhotosDraft[0].is_primary = true;
    }
  };

  const updateTripCoverPreview = () => {
    if (!tripImagePreview) return;
    if (!tripPhotosDraft.length) {
      tripImagePreview.src = TRIP_PLACEHOLDER;
      return;
    }
    const coverPhoto = tripPhotosDraft.find((photo) => photo.is_primary) || tripPhotosDraft[0];
    tripImagePreview.src = getPhotoPreviewSrc(coverPhoto);
  };

  const renderTripPhotoCard = (photo, index) => {
    const src = escapeHtml(getPhotoPreviewSrc(photo));
    const isPrimary = Boolean(photo.is_primary);
    return `
      <div class="relative rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden" data-trip-photo="${index}">
        <img src="${src}" alt="Trip photo ${index + 1}" class="w-full h-32 object-cover" />
        ${isPrimary ? '<span class="absolute top-2 left-2 rounded-full bg-sky-600/90 text-white text-[10px] font-semibold px-2 py-0.5">Cover</span>' : ''}
        <div class="flex items-center justify-between px-3 py-2 text-[11px] border-t border-slate-100 bg-slate-50/60">
          <button type="button" class="font-semibold text-sky-600 hover:text-sky-800 transition" data-trip-photo-action="set-cover" data-trip-photo-index="${index}">Jadikan Cover</button>
          <div class="flex items-center gap-1">
            <button type="button" class="rounded-full border border-slate-200 px-2 py-1 hover:bg-white" data-trip-photo-action="move" data-trip-photo-direction="prev" data-trip-photo-index="${index}" aria-label="Geser kiri">←</button>
            <button type="button" class="rounded-full border border-slate-200 px-2 py-1 hover:bg-white" data-trip-photo-action="move" data-trip-photo-direction="next" data-trip-photo-index="${index}" aria-label="Geser kanan">→</button>
            <button type="button" class="font-semibold text-red-500 hover:text-red-700 transition" data-trip-photo-action="remove" data-trip-photo-index="${index}">Hapus</button>
          </div>
        </div>
      </div>
    `;
  };

  const renderTripPhotoDrafts = () => {
    if (tripPhotosContainer) {
      if (!tripPhotosDraft.length) {
        tripPhotosContainer.innerHTML = '';
        if (tripPhotosEmptyState) tripPhotosEmptyState.classList.remove('hidden');
      } else {
        tripPhotosContainer.innerHTML = tripPhotosDraft.map((photo, index) => renderTripPhotoCard(photo, index)).join('');
        if (tripPhotosEmptyState) tripPhotosEmptyState.classList.add('hidden');
      }
    } else if (tripPhotosEmptyState && !tripPhotosDraft.length) {
      tripPhotosEmptyState.classList.remove('hidden');
    }
    updateTripCoverPreview();
  };

  const initializePhotoDrafts = (photos = []) => {
    if (Array.isArray(photos) && photos.length) {
      tripPhotosDraft = photos.map((photo, index) => createPhotoDraft(photo, index));
    } else {
      tripPhotosDraft = [];
    }
    ensureTripPhotoPrimary();
    renderTripPhotoDrafts();
  };

  const moveTripPhoto = (index, direction) => {
    if (Number.isNaN(index) || !tripPhotosDraft[index]) return;
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tripPhotosDraft.length) return;
    const [photo] = tripPhotosDraft.splice(index, 1);
    tripPhotosDraft.splice(targetIndex, 0, photo);
    renderTripPhotoDrafts();
  };

  const addTripPhotosFromFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const newDrafts = [];
    for (const file of list) {
      const dataUrl = await readFileAsDataUrl(file);
      newDrafts.push(createPhotoDraft({
        image_base64: dataUrl,
        preview_url: dataUrl,
        is_primary: false,
        sort_order: tripPhotosDraft.length + newDrafts.length + 1
      }));
    }
    tripPhotosDraft = tripPhotosDraft.concat(newDrafts);
    ensureTripPhotoPrimary();
    renderTripPhotoDrafts();
  };

  const buildTripPhotosPayload = () => tripPhotosDraft.map((photo, index) => {
    const payload = {
      sort_order: index + 1,
      is_primary: Boolean(photo.is_primary)
    };
    if (photo.id) {
      payload.id = photo.id;
    } else if (photo.image_base64) {
      payload.image_base64 = photo.image_base64;
    } else if (photo.photo_url) {
      payload.photo_url = photo.photo_url;
    }
    return payload;
  }).filter((photo) => photo.id || photo.image_base64 || photo.photo_url);

  const calculateInvoiceTotals = () => {
    const subtotal = invoiceDraft.items.reduce((acc, item) => {
      const qty = Number.isFinite(Number(item.qty)) ? Number(item.qty) : 0;
      const price = Number.isFinite(Number(item.price)) ? Number(item.price) : 0;
      return acc + (qty * price);
    }, 0);
    const tax = 0;
    const grossTotal = subtotal;
    const dpRaw = invoiceDraft.dpEnabled ? parseMoneyInput(invoiceDraft.dpAmount) : 0;
    const dpAmount = Math.min(Math.max(dpRaw, 0), grossTotal);
    invoiceDraft.dpAmount = dpAmount;
    return {
      subtotal,
      tax,
      grossTotal,
      dpAmount,
      total: Math.max(grossTotal - dpAmount, 0)
    };
  };

  const showInvoiceFormStatus = (message) => {
    if (!invoiceFormStatus) return;
    invoiceFormStatus.textContent = message || 'Invoice diperbarui';
    invoiceFormStatus.classList.remove('hidden');
    setTimeout(() => invoiceFormStatus.classList.add('hidden'), 2200);
  };

  const showInvoicePreviewStatus = (message) => {
    if (!invoicePreviewStatus) return;
    invoicePreviewStatus.textContent = message || 'Pratinjau diperbarui';
    invoicePreviewStatus.classList.remove('hidden');
    setTimeout(() => invoicePreviewStatus.classList.add('hidden'), 2200);
  };

  const renderInvoiceItemsForm = () => {
    if (!invoiceItemsContainer) return;
    if (!invoiceDraft.items.length) {
      invoiceItemsContainer.innerHTML = '';
      if (invoiceItemsEmptyState) invoiceItemsEmptyState.classList.remove('hidden');
      return;
    }
    if (invoiceItemsEmptyState) invoiceItemsEmptyState.classList.add('hidden');
    invoiceItemsContainer.innerHTML = invoiceDraft.items.map((item, index) => `
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" data-invoice-item="${index}">
        <div class="grid md:grid-cols-5 gap-3">
          <div class="md:col-span-3">
            <label class="text-xs font-semibold text-slate-500 uppercase">Deskripsi</label>
            <input type="text" data-invoice-field="description" data-invoice-index="${index}"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Deskripsi layanan" value="${escapeHtml(item.description || '')}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Qty</label>
            <input type="number" min="0" step="1" data-invoice-field="qty" data-invoice-index="${index}"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value="${escapeHtml(normalizeInputValue(item.qty || 1))}" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Harga</label>
            <input type="number" min="0" step="50000" data-invoice-field="price" data-invoice-index="${index}"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value="${escapeHtml(normalizeInputValue(item.price || 0))}" />
          </div>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-600">
          <span>Line total:
            <span class="font-semibold text-slate-900" data-invoice-line-total="${index}">${formatInvoiceMoney((item.qty || 0) * (item.price || 0))}</span>
          </span>
          <button type="button" class="text-red-500 font-semibold hover:text-red-700 transition" data-invoice-item-remove="${index}">Hapus</button>
        </div>
      </div>
    `).join('');
  };

  const renderInvoicePreview = (showStatus = false) => {
    if (!invoicePreviewNode) return;
    const totals = calculateInvoiceTotals();
    const fxMeta = updateDerivedFxTotals(totals);
    const fxContext = getInvoiceFxContext();
    const dpAmount = totals.dpAmount || 0;
    const dpActive = Boolean(invoiceDraft.dpEnabled);
    const { usdIdr, idrPerJpy, jpyPerUsd } = getFxRateSnapshot({
      usdIdr: fxMeta && fxMeta.fxRateValue !== undefined ? fxMeta.fxRateValue : undefined
    });
    const baseCode = normalizeInvoiceCurrencyCode(invoiceDraft.currencyCode);
    const itemRows = (() => {
      const rows = invoiceDraft.items.length
        ? invoiceDraft.items.map((item, index) => {
          const qty = Number.isFinite(Number(item.qty)) ? Number(item.qty) : 0;
          const price = Number.isFinite(Number(item.price)) ? Number(item.price) : 0;
          const lineTotal = qty * price;
          return `
            <tr class="border-b border-slate-200 last:border-b-0">
              <td class="py-2 px-3 text-sm text-slate-700 text-center">${index + 1}.</td>
              <td class="py-2 px-3 text-sm text-slate-700">${escapeHtml(item.description || '-')}</td>
              <td class="py-2 px-3 text-sm text-slate-700 text-right">${formatInvoiceMoney(price)}</td>
              <td class="py-2 px-3 text-sm text-slate-700 text-center">${qty}</td>
              <td class="py-2 px-3 text-sm text-slate-800 text-right font-semibold">${formatInvoiceMoney(lineTotal)}</td>
            </tr>
          `;
        })
        : [];

      if (dpActive && dpAmount > 0) {
        rows.push(`
          <tr class="border-b border-slate-200 last:border-b-0 bg-slate-50">
            <td class="py-2 px-3 text-sm text-slate-700 text-center">${rows.length + 1}.</td>
            <td class="py-2 px-3 text-sm text-slate-700">Down Payment (DP)</td>
            <td class="py-2 px-3 text-sm text-slate-700 text-right">-</td>
            <td class="py-2 px-3 text-sm text-slate-700 text-center">-</td>
            <td class="py-2 px-3 text-sm text-red-600 text-right font-semibold">${formatInvoiceMoney(dpAmount)}</td>
          </tr>
        `);
      }

      if (!rows.length) {
        return '<tr><td colspan="5" class="py-3 px-3 text-center text-slate-400 text-sm">Belum ada item.</td></tr>';
      }
      return rows.join('');
    })();

    const paymentInfoLines = (invoiceDraft.notes || '').split(/\r?\n/);
    while (paymentInfoLines.length && !paymentInfoLines[0].trim()) paymentInfoLines.shift();
    while (paymentInfoLines.length && !paymentInfoLines[paymentInfoLines.length - 1].trim()) paymentInfoLines.pop();
    const paymentLines = paymentInfoLines.length
      ? paymentInfoLines.map((line) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return '<div class="h-2"></div>';
        }
        return `<p class="text-sm text-slate-700 leading-6">${escapeHtml(trimmed)}</p>`;
      }).join('')
      : '<p class="text-slate-400">Belum ada detail pembayaran.</p>';

    const fxDisplays = (() => {
      const netTotal = totals.total || 0;
      let totalUsd = '-';
      let totalIdr = '-';
      let totalJpy = '-';
      const manualUsd = parseMoneyInput(invoiceDraft.manualTotalUsd);
      const manualIdr = parseMoneyInput(invoiceDraft.manualTotalIdr);
      const manualJpy = parseMoneyInput(invoiceDraft.manualTotalJpy);
      if (manualUsd > 0) totalUsd = formatInvoiceCurrency(manualUsd, 'USD');
      if (manualIdr > 0) totalIdr = formatInvoiceCurrency(manualIdr, 'IDR');
      if (manualJpy > 0) totalJpy = formatInvoiceCurrency(manualJpy, 'JPY');

      if (manualUsd > 0 || manualIdr > 0 || manualJpy > 0) {
        return {
          totalUsd,
          totalIdr,
          totalJpy,
          dpConverted: manualIdr > 0 && dpAmount > 0 ? formatInvoiceCurrency(dpAmount, 'IDR') : ''
        };
      }

      if (baseCode === 'USD') {
        totalUsd = formatInvoiceCurrency(netTotal, 'USD');
        totalIdr = usdIdr > 0 ? formatInvoiceCurrency(Math.round(netTotal * usdIdr), 'IDR') : '-';
        totalJpy = jpyPerUsd > 0 ? formatInvoiceCurrency(Math.round(netTotal * jpyPerUsd), 'JPY') : '-';
      } else if (baseCode === 'IDR') {
        totalIdr = formatInvoiceCurrency(netTotal, 'IDR');
        totalUsd = usdIdr > 0 ? formatInvoiceCurrency(Number((netTotal / usdIdr).toFixed(2)), 'USD') : '-';
        totalJpy = idrPerJpy > 0 ? formatInvoiceCurrency(Math.round(netTotal / idrPerJpy), 'JPY') : '-';
      } else if (baseCode === 'JPY') {
        totalJpy = formatInvoiceCurrency(netTotal, 'JPY');
        totalIdr = idrPerJpy > 0 ? formatInvoiceCurrency(Math.round(netTotal * idrPerJpy), 'IDR') : '-';
        totalUsd = jpyPerUsd > 0 ? formatInvoiceCurrency(Number((netTotal / jpyPerUsd).toFixed(2)), 'USD') : '-';
      }

      const dpConverted = (() => {
        if (dpAmount <= 0) return 0;
        if (baseCode === 'USD') return usdIdr > 0 ? Math.round(dpAmount * usdIdr) : 0;
        if (baseCode === 'IDR') return dpAmount;
        if (baseCode === 'JPY') return dpAmount;
        return 0;
      })();

      return {
        totalUsd,
        totalIdr,
        totalJpy,
        dpConverted: dpConverted > 0 ? formatInvoiceCurrency(dpConverted, baseCode === 'JPY' ? 'JPY' : 'IDR') : ''
      };
    })();

    const finalTotalLabel = dpActive ? 'Total Setelah DP' : 'Total';
    const convertedLabel = dpActive ? `${fxContext.labels.totalConverted} (setelah DP)` : fxContext.labels.totalConverted;
    const dpConvertedDisplay = fxDisplays.dpConverted || formatInvoiceCurrency(0, baseCode === 'JPY' ? 'JPY' : 'IDR');
    const dpRow = dpActive
      ? `
        <tr class="bg-white text-slate-700">
          <td class="px-3 py-2 font-semibold">Down Payment (DP)</td>
          <td class="px-3 py-2 text-right">${dpConvertedDisplay}</td>
        </tr>
      `
      : '';

    const totalsBox = `
      <table class="w-full text-sm border border-slate-300">
        <tr class="bg-slate-900 text-white">
          <td class="px-3 py-2 font-semibold uppercase tracking-wide">Total USD</td>
          <td class="px-3 py-2 font-semibold text-right">${fxDisplays.totalUsd}</td>
        </tr>
        <tr class="bg-slate-50 text-slate-700">
          <td class="px-3 py-2 font-semibold">Total IDR</td>
          <td class="px-3 py-2 text-right">${fxDisplays.totalIdr}</td>
        </tr>
        <tr class="bg-white text-slate-700">
          <td class="px-3 py-2 font-semibold">Total Yen</td>
          <td class="px-3 py-2 text-right">${fxDisplays.totalJpy || '-'}</td>
        </tr>
        ${dpRow}
        <tr class="bg-slate-900 text-white text-base">
          <td class="px-3 py-2 font-bold uppercase">${finalTotalLabel}</td>
          <td class="px-3 py-2 font-bold text-right">${formatInvoiceMoney(totals.total)}</td>
        </tr>
      </table>
    `;

    invoicePreviewNode.innerHTML = `
      <div class="invoice-template border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
        <div class="border-b border-slate-200">
          <div class="flex items-center justify-between px-6 py-5">
            <img src="assets/logo_invoice.png" alt="Logo" class="h-16 object-contain" onerror="this.style.display='none'">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-slate-400">MABARAKKA</p>
              <p class="text-sm font-semibold text-slate-600">Moslem Modesty</p>
            </div>
          </div>
          <div class="flex items-center w-full">
            <div class="h-12 w-24 bg-[#123c61]"></div>
            <div class="h-12 flex-1 bg-[#123c61] flex items-center justify-center">
              <span class="text-white text-3xl font-extrabold tracking-[0.18em] border-b-2 border-white pb-0.5">${getInvoiceTypeLabel(invoiceDraft.type).toUpperCase()}</span>
            </div>
            <div class="h-12 w-12 bg-[#123c61]"></div>
          </div>
        </div>
        <div class="px-8 py-6 space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <p class="text-xs uppercase text-slate-500 tracking-[0.2em]">Bill To:</p>
              <p class="mt-2 text-lg font-semibold text-slate-900">${escapeHtml(invoiceDraft.client || 'Nama Client')}</p>
            </div>
              <div class="text-sm text-slate-700 leading-6">
                <p>${getInvoiceTypeLabel(invoiceDraft.type)}# : <span class="font-semibold">${escapeHtml(invoiceDraft.number || '-')}</span></p>
                <p>Date : <span class="font-semibold">${formatDateOnly(invoiceDraft.issueDate)}</span></p>
              </div>
          </div>
          <div>
            <p class="text-xs uppercase text-slate-500 tracking-[0.2em]">From To :</p>
            <div class="mt-2 space-y-1 text-sm font-semibold text-slate-900">
              ${escapeHtml((invoiceDraft.fromName || '').trim()).split('\n').filter(Boolean).map((line) => `<p>${line}</p>`).join('') || '<p>-</p>'}
            </div>
          </div>
          <table class="w-full text-sm border border-slate-200">
            <thead class="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th class="py-2 px-3 text-center w-12">No</th>
                <th class="py-2 px-3 text-left">Item</th>
                <th class="py-2 px-3 text-right w-32">Price</th>
                <th class="py-2 px-3 text-center w-16">Qty</th>
                <th class="py-2 px-3 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody class="text-slate-800">${itemRows}</tbody>
          </table>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="md:col-span-1">${totalsBox}</div>
          </div>
        </div>
      </div>
    `;

    if (showStatus) {
      showInvoicePreviewStatus('Pratinjau diperbarui');
    }
  };
  const hydrateInvoiceForm = () => {
    if (!invoiceForm) return;
    const setValue = (name, value) => {
      const field = invoiceForm.querySelector(`[name="${name}"]`);
      if (field) field.value = value || '';
    };
    setValue('invoice-number', invoiceDraft.number);
    setValue('invoice-date', invoiceDraft.issueDate);
    setValue('invoice-client', invoiceDraft.client);
    setValue('invoice-notes', invoiceDraft.notes);
    setValue('invoice-total-usd', normalizeInputValue(invoiceDraft.totalUsd));
    setValue('invoice-fx-rate', normalizeInputValue(invoiceDraft.fxRate));
    setValue('invoice-total-idr', normalizeInputValue(invoiceDraft.totalIdr));
    if (invoiceCurrencySelect) {
      invoiceCurrencySelect.value = invoiceDraft.currencyCode || normalizeInvoiceCurrencyCode();
    }
    if (invoiceTypeSelect) {
      invoiceTypeSelect.value = invoiceDraft.type || 'BILLING';
    }
    if (invoiceFromInput) {
      const combined = [invoiceDraft.fromName, invoiceDraft.fromCompany].filter(Boolean).join('\n').trim();
      invoiceFromInput.value = combined || '';
    }
    if (invoiceFxRateInput) {
      invoiceFxRateInput.value = normalizeInputValue(invoiceDraft.fxRate);
    }
    if (invoiceFxRateJpyInput) {
      invoiceFxRateJpyInput.value = normalizeInputValue(invoiceDraft.fxRateJpy);
    }
    if (invoiceRateUsdInput) {
      invoiceRateUsdInput.value = '1';
    }
    if (invoiceTotalUsdInput) {
      invoiceTotalUsdInput.value = normalizeInputValue(invoiceDraft.manualTotalUsd);
    }
    if (invoiceTotalIdrInput) {
      invoiceTotalIdrInput.value = normalizeInputValue(invoiceDraft.manualTotalIdr);
    }
    if (invoiceTotalJpyInput) {
      invoiceTotalJpyInput.value = normalizeInputValue(invoiceDraft.manualTotalJpy);
    }
    syncInvoiceDpUi();
  };
  const resetInvoiceDraft = () => {
    invoiceDraft = getDefaultInvoiceDraft();
    renderInvoiceItemsForm();
    hydrateInvoiceForm();
    renderInvoicePreview(true);
    showInvoiceFormStatus('Form invoice direset');
  };

  const updateInvoiceLineTotal = (index) => {
    const node = document.querySelector(`[data-invoice-line-total="${index}"]`);
    const item = invoiceDraft.items[index];
    if (node && item) {
      const qty = Number.isFinite(Number(item.qty)) ? Number(item.qty) : 0;
      const price = Number.isFinite(Number(item.price)) ? Number(item.price) : 0;
      node.textContent = formatInvoiceMoney(qty * price);
    }
  };

  const buildInvoicePrintTemplate = () => {
    const totals = calculateInvoiceTotals();
    const fxMeta = updateDerivedFxTotals(totals);
    const fxContext = getInvoiceFxContext();
    const dpAmount = totals.dpAmount || 0;
    const dpActive = Boolean(invoiceDraft.dpEnabled);
    const finalTotalLabel = dpActive ? 'Total' : 'Total';
    const { usdIdr, idrPerJpy, jpyPerUsd } = getFxRateSnapshot({
      usdIdr: fxMeta && fxMeta.fxRateValue !== undefined ? fxMeta.fxRateValue : undefined
    });
    const baseCode = normalizeInvoiceCurrencyCode(invoiceDraft.currencyCode);
    const fxDisplays = (() => {
      const netTotal = totals.total || 0;
      let autoUsd = '-';
      let autoIdr = '-';
      let autoJpy = '-';

      if (baseCode === 'USD') {
        autoUsd = formatInvoiceCurrency(netTotal, 'USD');
        autoIdr = usdIdr > 0 ? formatInvoiceCurrency(Math.round(netTotal * usdIdr), 'IDR') : '-';
        autoJpy = jpyPerUsd > 0 ? formatInvoiceCurrency(Math.round(netTotal * jpyPerUsd), 'JPY') : '-';
      } else if (baseCode === 'IDR') {
        autoIdr = formatInvoiceCurrency(netTotal, 'IDR');
        autoUsd = usdIdr > 0 ? formatInvoiceCurrency(Number((netTotal / usdIdr).toFixed(2)), 'USD') : '-';
        autoJpy = idrPerJpy > 0 ? formatInvoiceCurrency(Math.round(netTotal / idrPerJpy), 'JPY') : '-';
      } else if (baseCode === 'JPY') {
        autoJpy = formatInvoiceCurrency(netTotal, 'JPY');
        autoUsd = jpyPerUsd > 0 ? formatInvoiceCurrency(Number((netTotal / jpyPerUsd).toFixed(2)), 'USD') : '-';
        autoIdr = idrPerJpy > 0 ? formatInvoiceCurrency(Math.round(netTotal * idrPerJpy), 'IDR') : '-';
      }

      const manualUsd = parseMoneyInput(invoiceDraft.manualTotalUsd);
      const manualIdr = parseMoneyInput(invoiceDraft.manualTotalIdr);
      const manualJpy = parseMoneyInput(invoiceDraft.manualTotalJpy);

      const chosenUsd = manualUsd > 0 ? formatInvoiceCurrency(manualUsd, 'USD') : autoUsd;
      const chosenIdr = manualIdr > 0 ? formatInvoiceCurrency(manualIdr, 'IDR') : autoIdr;
      const chosenJpy = manualJpy > 0 ? formatInvoiceCurrency(manualJpy, 'JPY') : autoJpy;

      const dpConverted = (() => {
        if (dpAmount <= 0) return '';
        if (manualIdr > 0) return formatInvoiceCurrency(dpAmount, 'IDR');
        if (manualUsd > 0) return formatInvoiceCurrency(dpAmount, 'USD');
        if (manualJpy > 0) return formatInvoiceCurrency(dpAmount, 'JPY');
        if (baseCode === 'USD') return usdIdr > 0 ? formatInvoiceCurrency(Math.round(dpAmount * usdIdr), 'IDR') : '';
        if (baseCode === 'IDR') return formatInvoiceCurrency(dpAmount, 'IDR');
        if (baseCode === 'JPY') return formatInvoiceCurrency(dpAmount, 'JPY');
        return '';
      })();

      return {
        totalUsd: chosenUsd,
        totalIdr: chosenIdr,
        totalJpy: chosenJpy,
        dpConverted
      };
    })();
    const dpConvertedDisplay = fxDisplays.dpConverted || formatInvoiceCurrency(0, normalizeInvoiceCurrencyCode(invoiceDraft.currencyCode) === 'JPY' ? 'JPY' : 'IDR');
    const dpRow = dpActive
      ? `<tr><td>DP</td><td style="text-align:right;">${dpConvertedDisplay}</td></tr>`
      : '';


    const itemRows = (() => {
      const rows = invoiceDraft.items.length
        ? invoiceDraft.items
          .map((item, index) => {
            const qty = Number.isFinite(Number(item.qty)) ? Number(item.qty) : 0;
            const price = Number.isFinite(Number(item.price)) ? Number(item.price) : 0;
            const lineTotal = qty * price;
            return `
                <tr>
                  <td>${index + 1}.</td>
                  <td>${escapeHtml(item.description || '-')}</td>
                  <td>${formatInvoiceMoney(price)}</td>
                  <td>${qty}</td>
                  <td>${formatInvoiceMoney(lineTotal)}</td>
                </tr>
              `;
          })
        : [];

      if (dpActive && dpAmount > 0) {
        rows.push(`
            <tr style="background:#f8fafc;">
              <td>${rows.length + 1}.</td>
              <td>Down Payment (DP)</td>
              <td>-</td>
              <td>-</td>
              <td>${formatInvoiceMoney(dpAmount)}</td>
            </tr>
        `);
      }

      if (!rows.length) {
        return '<tr><td colspan="5" style="text-align:center;padding:12px;color:#888;font-size:14px;">Belum ada item.</td></tr>';
      }
      return rows.join('');
    })();


    const paymentInfoLines = (invoiceDraft.notes || '').split(/\r?\n/);
    while (paymentInfoLines.length && !paymentInfoLines[0].trim()) paymentInfoLines.shift();
    while (paymentInfoLines.length && !paymentInfoLines[paymentInfoLines.length - 1].trim()) paymentInfoLines.pop();
    const paymentLines = paymentInfoLines.length
      ? paymentInfoLines
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '<br>';
          return `<p>${escapeHtml(trimmed)}</p>`;
        })
        .join('')
      : '<p style="color:#94a3b8;">Belum ada detail pembayaran.</p>';


    const totalsTable = `
      <table class="total-box">
        <tr class="dark"><td>Total USD</td><td style="text-align:right;">${fxDisplays.totalUsd}</td></tr>
        <tr><td>Total IDR</td><td style="text-align:right;">${fxDisplays.totalIdr}</td></tr>
        <tr class="muted"><td>Total Yen</td><td style="text-align:right;">${fxDisplays.totalJpy || '-'}</td></tr>
        ${dpRow}
        <tr class="dark"><td>${finalTotalLabel}</td><td style="text-align:right;">${formatInvoiceMoney(totals.total)}</td></tr>
      </table>
    `;


    const styles = `
      @page { margin: 8mm 5mm 10mm; }
      body { font-family: 'Inter', Arial, sans-serif; background: #f5f6f8; color:rgb(31, 31, 31) margin: 0; font-size: 18px; }
      .wrap { background: #ffffff; overflow: hidden; margin: 0 auto; }
      .header { border-bottom: 1px solid #e2e8f0; }
      .logo-block { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 26px 32px; margin-top: -40px; }
      .logo-block img { height: 200px; object-fit: contain; }
      .invoice-bar { display: flex; width: 100%; }
      .invoice-bar .segment { height: 64px; background: #123c61 }
      .invoice-bar .segment.flex { 
        flex: 1; 
        display: flex; 
        align-items: center; 
        justify-content: end; 
        padding-right: 50px;
      
      }
      .invoice-bar .segment.flex span { color: #123c61; font-size: 48px;  font-weight: 800; padding-bottom: 35px; background: #fff; padding-right: 20px; padding-left: 20px;}
      .section { padding: 24px 48px 36px; }
      .bill-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; margin-bottom: 32px; }
      .label { font-size: 18px; }
      .value { font-size: 18px; font-weight: 600; color:rgb(31, 31, 31) }
      .meta { font-size: 18px; color:rgb(31, 31, 31); line-height: 1.8; }
 
      /* TABEL ITEM */
      .items {
        width: 100%;
        border-collapse: collapse;
        border: 0.5px solid rgb(181, 181, 181);
      }
      .items th,
      .items td {
        border: 0.5px solid rgb(181, 181, 181);
      }
      .items th, .items td {
        font-size: 18px;
        padding-bottom: 14px;
        padding-left: 16px;
        padding-right: 16px;
      }
      .items th {  font-size: 18px; background-color:rgba(18, 60, 97, 0.09); }
      .items td:nth-child(1) { 
        width: 52px; 
        text-align: center;
      }
      .items td:nth-child(3), .items td:nth-child(5) { text-align: right; }
      .items td:nth-child(4) { width: 80px; text-align: center; }
 
      /* BARIS TOTAL ATAS */
      .total-header {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 26px;
        
      }
      .total-header .total-row td {
        font-size: 18px;
        font-weight: 700;
        border: 0.5px solid rgb(181, 181, 181);
        text-align: center;
        height: 50px;
        padding: 0;
        padding-bottom: 20px;
      }
      .total-header .total-row td:first-child {
        background-color:#123c61;
        color:#fff;
      }
 
      /* PEMBAYARAN */
      .payment-grid { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 32px; }
      .payment-grid .pay-info { flex: 1; max-width: 60%; }
      .payment-grid .total-box { margin-left: auto; width: 280px; }
      .pay-info { font-size: 16px; line-height: 1.8; color:rgb(31, 31, 31) }
      .pay-info p { margin: 0 0 6px; }
      .total-box { border: 1px solid rgb(181, 181, 181); font-size: 18px; }
      .total-box tr td:first-child { font-weight: 600; padding-bottom: 20px }
      .total-box td { height: 20px; padding-left: 12px; padding-right: 12px; padding-bottom: 20px    }
      .total-box .dark { background: rgba(18, 60, 97, 0.09); font-weight: 700; height: 20px; padding-left: 12px; padding-right: 12px; padding-bottom: 20px}
      .total-box .muted { background: #f8fafc; color:rgb(31, 31, 31); }
      .footnote { color: #c62828; font-size: 14px; font-style: italic; margin-top: 16px; }
      .item-list { margin-top: 8px; }
    `;



    const html = `
      <div class="wrap">
        <div class="header">
          <div class="logo-block">
            <img src="assets/logo-invoice.png" alt="Logo" onerror="this.style.display='none'">
          </div>
          <div class="invoice-bar">
            <div class="segment flex"><span>${getInvoiceTypeLabel(invoiceDraft.type).toUpperCase()}</span></div>
          </div>
        </div>
 
        <div class="section">
          <div class="bill-grid">
            <div>
              <p class="label">Bill To:</p>
              <p class="value">${escapeHtml(invoiceDraft.client || '')}</p>
            </div>
            <div class="meta">
              <p>${getInvoiceTypeLabel(invoiceDraft.type)}# : <strong>${escapeHtml(invoiceDraft.number || '')}</strong></p>
              <p>Date : <strong>${formatDateOnly(invoiceDraft.issueDate)}</strong></p>
            </div>
          </div>
 
          <div class="bill-grid" style="margin-bottom:24px;">
            <div class="meta">
              <p class="label">From To :</p>
              ${(invoiceDraft.fromName || '').split(/\r?\n/).filter((line) => line.trim()).map((line) => `<p><strong>${escapeHtml(line.trim())}</strong></p>`).join('') || '<p><strong>-</strong></p>'}
            </div>
          </div>
 
          <!-- Baris TOTAL di atas tabel item -->
          <table class="items total-header">
            <tbody>
              <tr class="total-row">
                <td colspan="4">${finalTotalLabel}</td>
                <td>${formatInvoiceMoney(totals.total)}</td>
              </tr>
            </tbody>
          </table>
 
          <!-- Tabel Item -->
          <table class="items item-list">
            <thead>
              <tr>
                <th>No</th>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
 
          <!-- Bagian Pembayaran -->
          <div class="payment-grid">
            <div class="pay-info">
              <p class="label" style="margin-bottom:8px;">Payment Inf</p>
              ${paymentLines}
              ${invoiceDraft.paymentFootnote ? `<p class="footnote">${escapeHtml(invoiceDraft.paymentFootnote)}</p>` : ''}
              <p class="footnote">Dalam waktu 10 hari sejak tanggal permintaan pembayaran.</p>
            </div>
            <div>${totalsTable}</div>
          </div>

        <div style="margin-top:32px; text-align:right;">
          <div style="display:flex; justify-content:flex-end;">
            <img src="assets/ttd.png" alt="Tanda Tangan" style="height:150px; margin-top:8px;">
          </div>
          <p style="font-size:14px; margin-bottom:8px;">PT MABARAKKA MOSLEM MODESTY</p>
        </div>
        </div>
      </div>
    `;


    return { styles, html };
  };



  const openInvoicePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) {
      alert('Popup diblokir browser, izinkan untuk print.');
      return;
    }
    const { styles, html } = buildInvoicePrintTemplate();
    printWindow.document.write(`
      <html>
        <head>
          <title>${escapeHtml(invoiceDraft.number || 'Invoice MOSTYCOM')}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${html}
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadInvoicePreviewPdf = async () => {
    if (typeof window.html2canvas !== 'function') {
      throw new Error('Fitur html2canvas belum dimuat.');
    }
    const JsPdfConstructor = window.jspdf && window.jspdf.jsPDF;
    if (typeof JsPdfConstructor !== 'function') {
      throw new Error('Fitur jsPDF belum dimuat.');
    }
    const { styles, html } = buildInvoicePrintTemplate();
    const hiddenContainer = document.createElement('div');
    hiddenContainer.style.position = 'fixed';
    hiddenContainer.style.left = '-9999px';
    hiddenContainer.style.top = '0';
    hiddenContainer.style.width = '900px';
    hiddenContainer.innerHTML = `<style>${styles}</style>${html}`;
    document.body.appendChild(hiddenContainer);
    const target = hiddenContainer.querySelector('.wrap') || hiddenContainer;
    const canvas = await window.html2canvas(target, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    });
    document.body.removeChild(hiddenContainer);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new JsPdfConstructor('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    const canvasRatio = canvas.height / canvas.width;
    let renderWidth = availableWidth;
    let renderHeight = renderWidth * canvasRatio;
    if (renderHeight > availableHeight) {
      renderHeight = availableHeight;
      renderWidth = renderHeight / canvasRatio;
    }
    const offsetX = (pageWidth - renderWidth) / 2;
    const offsetY = margin;
    pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, renderHeight, '', 'FAST');
    pdf.save(`${getInvoiceDownloadName()}.pdf`);
  };

  // Inisialisasi invoice setelah fungsi helper siap
  if (invoiceForm) {
    renderInvoiceItemsForm();
    hydrateInvoiceForm();
    renderInvoicePreview();
    updateInvoiceCurrencyUi();
    if (invoiceCurrencySelect) {
      invoiceCurrencySelect.value = invoiceDraft.currencyCode || normalizeInvoiceCurrencyCode();
      invoiceCurrencySelect.addEventListener('change', (event) => {
        const target = event.target;
        if (!target) return;
        const selectedCode = normalizeInvoiceCurrencyCode(target.value);
        invoiceDraft.currencyCode = selectedCode;
        invoiceDraft.currencySymbol = getInvoiceCurrencyConfig(selectedCode).symbol;
        target.value = selectedCode;
        renderInvoiceItemsForm();
        renderInvoicePreview(true);
        updateInvoiceCurrencyUi();
        showInvoiceFormStatus(`Mata uang: ${getInvoiceCurrencyConfig(selectedCode).label}`);
        showInvoicePreviewStatus('Nominal mengikuti mata uang baru');
      });
    }
    if (invoiceTypeSelect) {
      invoiceTypeSelect.value = invoiceDraft.type || 'BILLING';
      invoiceTypeSelect.addEventListener('change', (event) => {
        const target = event.target;
        if (!target) return;
        const value = target.value;
        if (!INVOICE_TYPES[value]) return;
        invoiceDraft.type = value;
        target.value = value;
        renderInvoicePreview(true);
        showInvoiceFormStatus(`Tipe tagihan: ${getInvoiceTypeLabel(value)}`);
        showInvoicePreviewStatus(`${getInvoiceTypeLabel(value)} aktif`);
      });
    }
  }

  const mapServerRouteToDraft = (route) => ({
    nama_rute: route?.nama_rute || '',
    deskripsi_rute: route?.deskripsi_rute || '',
    durasi: route?.durasi || '',
    harga: route?.harga || '',
    kapasitas: normalizeInputValue(route?.kapasitas ?? ''),
    slot_tersedia: normalizeInputValue(route?.slot_tersedia ?? ''),
    schedules: Array.isArray(route?.schedules)
      ? route.schedules.map((schedule) => ({
        tanggal_mulai: schedule?.tanggal_mulai || '',
        tanggal_selesai: schedule?.tanggal_selesai || '',
        kuota: normalizeInputValue(schedule?.kuota ?? ''),
        slot_tersedia: normalizeInputValue(schedule?.slot_tersedia ?? ''),
        status: schedule?.status || 'open'
      }))
      : []
  });

  const renderScheduleStatusOptions = (currentValue) => ROUTE_SCHEDULE_STATUS_OPTIONS
    .map(({ value, label }) => `<option value="${value}" ${value === (currentValue || 'open') ? 'selected' : ''}>${label}</option>`)
    .join('');

  const renderRouteScheduleRows = (route, routeIndex) => {
    if (!route.schedules.length) {
      return `<div class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500" data-route-schedule-empty="${routeIndex}">
        Belum ada jadwal untuk rute ini.
      </div>`;
    }

    return route.schedules
      .map((schedule, scheduleIndex) => `
        <div class="rounded-2xl border border-slate-200 bg-white p-4" data-route-schedule="${routeIndex}-${scheduleIndex}">
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-semibold text-slate-600">Jadwal #${scheduleIndex + 1}</p>
            <button type="button" class="text-xs font-semibold text-red-500 hover:text-red-600" data-schedule-remove="${scheduleIndex}" data-route-index="${routeIndex}">Hapus</button>
          </div>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label class="text-xs font-medium text-slate-500">Tanggal Mulai</label>
              <input type="date" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value="${escapeHtml(schedule.tanggal_mulai)}" data-route-index="${routeIndex}" data-schedule-index="${scheduleIndex}" data-schedule-field="tanggal_mulai" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Tanggal Selesai</label>
              <input type="date" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value="${escapeHtml(schedule.tanggal_selesai)}" data-route-index="${routeIndex}" data-schedule-index="${scheduleIndex}" data-schedule-field="tanggal_selesai" />
            </div>
          </div>
          <div class="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <label class="text-xs font-medium text-slate-500">Kuota</label>
              <input type="number" min="0" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value="${escapeHtml(normalizeInputValue(schedule.kuota))}" data-route-index="${routeIndex}" data-schedule-index="${scheduleIndex}" data-schedule-field="kuota" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Slot Tersedia</label>
              <input type="number" min="0" class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                value="${escapeHtml(normalizeInputValue(schedule.slot_tersedia))}" data-route-index="${routeIndex}" data-schedule-index="${scheduleIndex}" data-schedule-field="slot_tersedia" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Status</label>
              <select class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                data-route-index="${routeIndex}" data-schedule-index="${scheduleIndex}" data-schedule-field="status">
                ${renderScheduleStatusOptions(schedule.status)}
              </select>
            </div>
          </div>
        </div>
      `)
      .join('');
  };

  const renderRouteCard = (route, index) => `
    <div class="rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm" data-route-card="${index}">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase text-slate-400">Rute #${index + 1}</p>
          <h4 class="text-base font-semibold text-slate-900">${escapeHtml(route.nama_rute || 'Rute Baru')}</h4>
        </div>
        <button type="button" class="text-xs font-semibold text-red-500 hover:text-red-600" data-route-remove="${index}">Hapus</button>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label class="text-sm font-medium text-slate-600">Nama Rute</label>
          <input type="text" data-route-field="nama_rute" data-route-index="${index}"
            class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Contoh: Route A - Sydney" value="${escapeHtml(route.nama_rute)}" />
        </div>
        <div>
          <label class="text-sm font-medium text-slate-600">Durasi</label>
          <input type="text" data-route-field="durasi" data-route-index="${index}"
            class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Contoh: 5 Hari 4 Malam" value="${escapeHtml(route.durasi)}" />
        </div>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label class="text-sm font-medium text-slate-600">Harga</label>
          <input type="text" data-route-field="harga" data-route-index="${index}"
            class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Contoh: 25.000.000" value="${escapeHtml(route.harga)}" />
        </div>
        <div>
          <label class="text-sm font-medium text-slate-600">Kapasitas</label>
          <input type="number" min="0" data-route-field="kapasitas" data-route-index="${index}"
            class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="0" value="${escapeHtml(normalizeInputValue(route.kapasitas))}" />
        </div>
        <div>
          <label class="text-sm font-medium text-slate-600">Slot Tersedia</label>
          <input type="number" min="0" data-route-field="slot_tersedia" data-route-index="${index}"
            class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="0" value="${escapeHtml(normalizeInputValue(route.slot_tersedia))}" />
        </div>
      </div>
      <div class="mt-4">
        <label class="text-sm font-medium text-slate-600">Deskripsi Rute</label>
        <textarea rows="2" data-route-field="deskripsi_rute" data-route-index="${index}"
          class="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Highlight itinerary, kota yang dikunjungi, dsb.">${escapeHtml(route.deskripsi_rute)}</textarea>
      </div>
      <div class="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-700">Jadwal & Slot</p>
            <p class="text-xs text-slate-500">Tambah tanggal keberangkatan beserta kuota peserta.</p>
          </div>
          <button type="button" class="rounded-2xl border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            data-route-schedule-add="${index}">Tambah Jadwal</button>
        </div>
        <div class="mt-3 space-y-3" data-route-schedules="${index}">
          ${renderRouteScheduleRows(route, index)}
        </div>
      </div>
    </div>
  `;

  const renderTripRouteDrafts = () => {
    if (!tripRoutesContainer) return;
    if (!tripRouteDrafts.length) {
      if (tripRouteEmptyState) tripRouteEmptyState.classList.remove('hidden');
      tripRoutesContainer.innerHTML = '';
      return;
    }
    if (tripRouteEmptyState) tripRouteEmptyState.classList.add('hidden');
    tripRoutesContainer.innerHTML = tripRouteDrafts.map((route, index) => renderRouteCard(route, index)).join('');
  };

  const initializeRouteDrafts = (routes = []) => {
    if (Array.isArray(routes) && routes.length) {
      tripRouteDrafts = routes.map(mapServerRouteToDraft);
    } else {
      tripRouteDrafts = [createEmptyRouteDraft()];
    }
    renderTripRouteDrafts();
  };

  const summarizeTripRoutes = (routes) => {
    const safeRoutes = Array.isArray(routes) ? routes : [];
    const names = safeRoutes.slice(0, 2).map((route) => route.nama_rute || 'Rute');
    const totalSchedules = safeRoutes.reduce(
      (sum, route) => sum + (Array.isArray(route.schedules) ? route.schedules.length : 0),
      0
    );
    const totalSlots = safeRoutes.reduce(
      (sum, route) => sum + (Number(route.slot_tersedia) || 0),
      0
    );
    return {
      totalRoutes: safeRoutes.length,
      totalSchedules,
      totalSlots,
      label: names.length ? names.join(', ') : 'Rute belum diatur'
    };
  };

  const normalizeTripRecord = (trip) => {
    if (!trip || typeof trip !== 'object') {
      return { routes: [], photos: [] };
    }
    return {
      ...trip,
      routes: Array.isArray(trip.routes)
        ? trip.routes.map((route) => ({
          ...route,
          schedules: Array.isArray(route.schedules) ? route.schedules : []
        }))
        : [],
      photos: Array.isArray(trip.photos)
        ? trip.photos.map((photo, index) => ({
          id: typeof photo.id === 'number' ? photo.id : (photo.id ? Number(photo.id) : null),
          photo_url: photo.photo_url || null,
          photo_full_url: photo.photo_full_url || photo.photo_url || null,
          is_primary: Boolean(photo.is_primary),
          sort_order: Number.isFinite(Number(photo.sort_order)) ? Number(photo.sort_order) : index + 1
        }))
        : []
    };
  };

  const buildRoutePayload = () => {
    if (!tripRouteDrafts.length) {
      return [];
    }
    return tripRouteDrafts
      .map((route) => {
        const namaRute = (route.nama_rute || '').trim();
        const deskripsiRute = (route.deskripsi_rute || '').trim();
        const durasi = (route.durasi || '').trim();
        const harga = (route.harga || '').trim();
        const kapasitas = Number(route.kapasitas) || 0;
        const slotRute = route.slot_tersedia === '' ? kapasitas : (Number(route.slot_tersedia) || 0);
        const schedules = Array.isArray(route.schedules)
          ? route.schedules
            .map((schedule) => {
              const tanggalMulai = (schedule.tanggal_mulai || '').trim();
              if (!tanggalMulai) return null;
              const tanggalSelesai = (schedule.tanggal_selesai || '').trim();
              const kuota = Number(schedule.kuota) || 0;
              const slotTersedia = schedule.slot_tersedia === '' ? kuota : (Number(schedule.slot_tersedia) || 0);
              const status = (schedule.status || 'open').toLowerCase();
              return {
                tanggal_mulai: tanggalMulai,
                tanggal_selesai: tanggalSelesai || null,
                kuota,
                slot_tersedia: slotTersedia,
                status
              };
            })
            .filter(Boolean)
          : [];
        return {
          nama_rute: namaRute,
          deskripsi_rute: deskripsiRute,
          durasi,
          harga,
          kapasitas,
          slot_tersedia: slotRute,
          schedules
        };
      })
      .filter((route) => route.nama_rute !== '');
  };

  initializeRouteDrafts();
  initializePhotoDrafts();

  if (tripRouteAddBtn) {
    tripRouteAddBtn.addEventListener('click', () => {
      tripRouteDrafts.push(createEmptyRouteDraft());
      renderTripRouteDrafts();
    });
  }

  if (tripRoutesContainer) {
    ['input', 'change'].forEach((eventName) => {
      tripRoutesContainer.addEventListener(eventName, (event) => {
        const target = event.target;
        if (!target || !target.dataset) return;
        const { routeField, routeIndex, scheduleField, scheduleIndex } = target.dataset;
        const parsedRouteIndex = Number(routeIndex);
        if (routeField && !Number.isNaN(parsedRouteIndex) && tripRouteDrafts[parsedRouteIndex]) {
          tripRouteDrafts[parsedRouteIndex][routeField] = target.value;
        }
        if (scheduleField) {
          const parsedScheduleIndex = Number(scheduleIndex);
          if (
            !Number.isNaN(parsedRouteIndex) &&
            !Number.isNaN(parsedScheduleIndex) &&
            tripRouteDrafts[parsedRouteIndex] &&
            Array.isArray(tripRouteDrafts[parsedRouteIndex].schedules) &&
            tripRouteDrafts[parsedRouteIndex].schedules[parsedScheduleIndex]
          ) {
            tripRouteDrafts[parsedRouteIndex].schedules[parsedScheduleIndex][scheduleField] = target.value;
          }
        }
      });
    });

    tripRoutesContainer.addEventListener('click', (event) => {
      const routeRemoveBtn = event.target.closest('[data-route-remove]');
      if (routeRemoveBtn) {
        const index = Number(routeRemoveBtn.dataset.routeRemove);
        if (Number.isNaN(index)) return;
        if (tripRouteDrafts.length <= 1) {
          alert('Minimal harus ada 1 rute pada setiap trip.');
          return;
        }
        tripRouteDrafts.splice(index, 1);
        renderTripRouteDrafts();
        return;
      }

      const addScheduleBtn = event.target.closest('[data-route-schedule-add]');
      if (addScheduleBtn) {
        const index = Number(addScheduleBtn.dataset.routeScheduleAdd);
        if (Number.isNaN(index) || !tripRouteDrafts[index]) return;
        if (!Array.isArray(tripRouteDrafts[index].schedules)) {
          tripRouteDrafts[index].schedules = [];
        }
        tripRouteDrafts[index].schedules.push(createEmptyScheduleDraft());
        renderTripRouteDrafts();
        return;
      }

      const scheduleRemoveBtn = event.target.closest('[data-schedule-remove]');
      if (scheduleRemoveBtn) {
        const routeIndex = Number(scheduleRemoveBtn.dataset.routeIndex);
        const scheduleIndex = Number(scheduleRemoveBtn.dataset.scheduleRemove);
        if (
          Number.isNaN(routeIndex) ||
          Number.isNaN(scheduleIndex) ||
          !tripRouteDrafts[routeIndex] ||
          !Array.isArray(tripRouteDrafts[routeIndex].schedules)
        ) {
          return;
        }
        tripRouteDrafts[routeIndex].schedules.splice(scheduleIndex, 1);
        renderTripRouteDrafts();
      }
    });
  }

  if (tripPhotosContainer) {
    tripPhotosContainer.addEventListener('click', (event) => {
      const button = event.target.closest('[data-trip-photo-action]');
      if (!button) return;
      const index = Number(button.dataset.tripPhotoIndex);
      if (Number.isNaN(index) || !tripPhotosDraft[index]) return;
      const action = button.dataset.tripPhotoAction;
      if (action === 'move') {
        const direction = button.dataset.tripPhotoDirection === 'prev' ? 'prev' : 'next';
        moveTripPhoto(index, direction);
        return;
      }
      if (action === 'set-cover') {
        tripPhotosDraft.forEach((photo, photoIndex) => {
          photo.is_primary = photoIndex === index;
        });
      } else if (action === 'remove') {
        tripPhotosDraft.splice(index, 1);
      }
      ensureTripPhotoPrimary();
      renderTripPhotoDrafts();
    });
  }

  const buildTripRouteMeta = (routes) => {
    const list = Array.isArray(routes) ? routes : [];
    if (!list.length) {
      return {
        meta: 'Belum ada rute',
        names: 'Tambahkan rute untuk menampilkan opsi itinerary'
      };
    }
    const scheduleCount = list.reduce((total, route) => total + (Array.isArray(route.schedules) ? route.schedules.length : 0), 0);
    const slotCount = list.reduce((total, route) => total + (Number(route.slot_tersedia) || 0), 0);
    const names = list
      .map((route) => route.nama_rute || 'Rute Tanpa Nama')
      .slice(0, 2)
      .join(', ');
    const extra = list.length > 2 ? ` +${list.length - 2} rute` : '';
    return {
      meta: `${list.length} rute · ${scheduleCount} jadwal · ${slotCount} slot`,
      names: `${names || 'Rute tersedia'}${extra}`
    };
  };

  initializeRouteDrafts();

  const tripCountNode = document.getElementById('trip-count');
  const articleCountNode = document.getElementById('article-count');
  const draftCountNode = document.getElementById('draft-count');
  const tripListNode = document.getElementById('trip-list');
  const articleListNode = document.getElementById('article-list');
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');
  const contactHeaderImageInput = document.getElementById('contact-header-image-input');
  const contactHeaderImagePreview = document.getElementById('contact-header-image-preview');
  const contactTrustImageInput = document.getElementById('contact-trust-image-input');
  const contactTrustImagePreview = document.getElementById('contact-trust-image-preview');
  const userForm = document.getElementById('user-form');
  const userListNode = document.getElementById('user-list');
  const userCountNode = document.getElementById('user-count');
  const userSaveBtn = document.getElementById('user-save-btn');
  const userCancelBtn = document.getElementById('user-cancel-btn');
  const testimonialForm = document.getElementById('testimonial-form');
  const testimonialListNode = document.getElementById('testimonial-list');
  const testimonialCountNode = document.getElementById('testimonial-count');
  const testimonialSaveBtn = document.getElementById('testimonial-save-btn');
  const testimonialCancelBtn = document.getElementById('testimonial-cancel-btn');
  const testimonialImageInput = document.getElementById('testimonial-image-input');
  const testimonialImagePreview = document.getElementById('testimonial-image-preview');
  const faqForm = document.getElementById('faq-form');
  const faqListNode = document.getElementById('faq-list');
  const faqCountNode = document.getElementById('faq-count');
  const faqSaveBtn = document.getElementById('faq-save-btn');
  const faqCancelBtn = document.getElementById('faq-cancel-btn');
  const customerTripForm = document.getElementById('customer-trip-form');
  const customerTripTableBody = document.getElementById('customer-trip-table-body');
  const customerTripSaveBtn = document.getElementById('customer-trip-save-btn');
  const customerTripCancelBtn = document.getElementById('customer-trip-cancel-btn');
  const customerTripFormStatus = document.getElementById('customer-trip-form-status');
  const customerTripTotalNode = document.getElementById('customer-trip-total');
  const customerTripSearchForm = document.getElementById('customer-trip-search');
  const customerTripSearchResetBtn = document.getElementById('customer-trip-search-reset');

  const formatTripSchedule = (value) => {
    if (!value) return 'Jadwal menyusul';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getCustomerTripStatusLabel = (status) => {
    const key = (status || '').toLowerCase();
    return CUSTOMER_TRIP_STATUS_LABELS[key] || status || 'Pending';
  };

  const getCustomerTripStatusClasses = (status) => {
    const key = (status || '').toLowerCase();
    return CUSTOMER_TRIP_STATUS_CLASSES[key] || 'bg-slate-100 text-slate-600';
  };

  const isCustomerTripFilterActive = () => {
    return Object.values(customerTripFilters).some((value) => typeof value === 'string' && value.trim() !== '');
  };

  const buildCustomerTripQuery = () => {
    const params = new URLSearchParams();
    if (customerTripFilters.nama) params.set('nama', customerTripFilters.nama);
    if (customerTripFilters.kode_booking) params.set('kode_booking', customerTripFilters.kode_booking);
    if (customerTripFilters.status) params.set('status', customerTripFilters.status);
    const query = params.toString();
    return query ? `?${query}` : '';
  };

  const syncCustomerTripSearchForm = () => {
    if (!customerTripSearchForm) return;
    const elements = customerTripSearchForm.elements;
    if (elements['customer-search-name']) {
      elements['customer-search-name'].value = customerTripFilters.nama;
    }
    if (elements['customer-search-booking']) {
      elements['customer-search-booking'].value = customerTripFilters.kode_booking;
    }
    if (elements['customer-search-status']) {
      elements['customer-search-status'].value = customerTripFilters.status;
    }
  };

  const renderTrips = () => {
    if (tripCountNode) tripCountNode.textContent = trips.length;
    if (overviewTripCountNode) {
      const publishedTrips = trips.filter((trip) => (trip.status || '').toLowerCase() === 'publish').length;
      overviewTripCountNode.textContent = publishedTrips;
    }
    if (!tripListNode) return;
    tripListNode.innerHTML = trips
      .map((trip) => {
        const imageSrc = trip.gambar_url || TRIP_PLACEHOLDER;
        const isPublish = (trip.status || '').toLowerCase() === 'publish';
        const statusLabel = isPublish ? 'Publish' : 'Draft';
        const routeMeta = summarizeTripRoutes(trip.routes);
        const routeInfo = routeMeta.totalRoutes
          ? `${routeMeta.totalRoutes} rute · ${routeMeta.totalSchedules} jadwal · ${routeMeta.totalSlots} slot`
          : 'Rute belum diatur';
        return `
        <li class="flex items-start gap-4 py-3 border-b border-slate-200 last:border-0">
          <img src="${imageSrc}" alt="${trip.nama_trip}" class="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
          <div class="flex-1">
            <p class="font-semibold text-slate-900">${trip.nama_trip}</p>
            <p class="text-sm text-slate-500">${trip.destinasi || 'Destinasi TBA'} · ${formatTripSchedule(trip.jadwal)}</p>
            <p class="text-xs text-slate-400 mt-1">${routeInfo}</p>
            ${routeMeta.totalRoutes ? `<p class="text-xs text-slate-500 mt-0.5">Pilihan: ${escapeHtml(routeMeta.label)}</p>` : ''}
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="text-xs font-semibold px-3 py-1 rounded-full ${isPublish ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}">${statusLabel}</span>
            <div class="flex gap-2 text-xs">
              <button class="px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition" data-trip-action="edit" data-trip-id="${trip.id}">Edit</button>
              <button class="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition" data-trip-action="delete" data-trip-id="${trip.id}">Delete</button>
            </div>
          </div>
        </li>
      `;
      })
      .join('');
  };

  const renderArticles = () => {
    if (articleCountNode) articleCountNode.textContent = articles.length;
    if (overviewArticleCountNode) {
      const publishedArticles = articles.filter((article) => (article.status || '').toLowerCase() === 'publish').length;
      overviewArticleCountNode.textContent = publishedArticles;
    }
    if (!articleListNode) return;
    articleListNode.innerHTML = articles
      .map((article) => {
        const imageSrc = article.gambar_url || ARTICLE_PLACEHOLDER;
        const snippet = (article.isi || 'Belum ada konten').slice(0, 110);
        const statusValue = (article.status || 'draft').toLowerCase();
        const isPublish = statusValue === 'publish';
        return `
        <li class="flex items-start gap-4 py-3 border-b border-slate-200 last:border-0">
          <img src="${imageSrc}" alt="${article.judul}" class="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
          <div class="flex-1">
            <p class="font-semibold text-slate-900">${article.judul}</p>
            <p class="text-xs uppercase text-slate-400 mt-1">${article.kategori || 'General'}</p>
            <p class="text-sm text-slate-500 mt-1">${snippet}${article.isi && article.isi.length > 110 ? '…' : ''}</p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="text-xs font-semibold px-3 py-1 rounded-full ${isPublish ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}">${statusValue === 'publish' ? 'Publish' : statusValue === 'review' ? 'Review' : 'Draft'}</span>
            <div class="flex gap-2 text-xs">
              <button class="px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition" data-article-action="edit" data-article-id="${article.id}">Edit</button>
              <button class="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition" data-article-action="delete" data-article-id="${article.id}">Delete</button>
            </div>
          </div>
        </li>
      `;
      })
      .join('');
  };

  const renderTestimonials = () => {
    if (testimonialCountNode) testimonialCountNode.textContent = `${testimonials.length} Testimoni`;
    if (!testimonialListNode) return;
    if (!testimonials.length) {
      testimonialListNode.innerHTML = '<li class="py-4 text-center text-slate-400 text-sm">Belum ada testimoni</li>';
      return;
    }
    testimonialListNode.innerHTML = testimonials
      .map((item) => {
        const stars = '★★★★★'.slice(0, item.rate || 0);
        const imageSrc = item.image_url || TESTIMONIAL_IMAGE_PLACEHOLDER;
        return `
        <li class="py-4 flex items-start gap-4">
          <img src="${imageSrc}" alt="${item.nama}" class="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
          <div class="flex-1">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-900">${item.nama}</p>
                <p class="text-xs text-amber-500 tracking-widest">${stars}</p>
              </div>
              <div class="flex gap-2 text-xs">
                <button class="px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition" data-testimonial-action="edit" data-testimonial-id="${item.id}">Edit</button>
                <button class="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition" data-testimonial-action="delete" data-testimonial-id="${item.id}">Delete</button>
              </div>
            </div>
            <p class="text-sm text-slate-600 mt-2">"${item.isi}"</p>
          </div>
        </li>
      `;
      })
      .join('');
  };

  const renderFaqs = () => {
    if (faqCountNode) faqCountNode.textContent = `${faqs.length} FAQ`;
    if (!faqListNode) return;
    if (!faqs.length) {
      faqListNode.innerHTML = '<li class="py-4 text-center text-slate-400 text-sm">Belum ada FAQ</li>';
      return;
    }
    faqListNode.innerHTML = faqs
      .map((faq) => `
        <li class="py-4 flex flex-col gap-2">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-semibold text-slate-900">${faq.judul}</p>
              <p class="text-sm text-slate-600 mt-1">${faq.isi}</p>
            </div>
            <div class="flex gap-2 text-xs">
              <button class="px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition" data-faq-action="edit" data-faq-id="${faq.id}">Edit</button>
              <button class="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition" data-faq-action="delete" data-faq-id="${faq.id}">Delete</button>
            </div>
          </div>
        </li>
      `)
      .join('');
  };

  const renderDraftCount = () => {
    if (!draftCountNode) return;
    const draftTrips = trips.filter((trip) => (trip.status || '').toLowerCase() !== 'publish').length;
    const draftArticles = articles.filter((article) => (article.status || '').toLowerCase() !== 'publish').length;
    draftCountNode.textContent = draftTrips + draftArticles;
  };

  const getContactValue = (key) => {
    const current = contact && Object.prototype.hasOwnProperty.call(contact, key) ? contact[key] : null;
    if (typeof current === 'string') {
      return current.trim() !== '' ? current : (defaultContact[key] || '');
    }
    if (current === undefined || current === null || current === '') {
      return defaultContact[key] || '';
    }
    return current;
  };

  const renderContact = () => {
    const titleValue = getContactValue('judul_section');
    const descriptionValue = getContactValue('deskripsi_singkat');
    const hoursValue = getContactValue('jam_operasional');
    const emailValue = getContactValue('email');
    const phoneValue = getContactValue('telepon');
    const whatsappValue = getContactValue('no_wa');
    const addressValue = getContactValue('alamat_lengkap');
    const latValue = getContactValue('latitude');
    const lngValue = getContactValue('longitude');
    const visionValue = getContactValue('visi');
    const missionValue = getContactValue('misi');
    const trustScoreValue = getContactValue('trush_score');
    const reviewValue = getContactValue('ulasan');
    const aboutValue = getContactValue('deskripsi_about');
    const aboutTitleValue = getContactValue('judul_about');
    const headerImageUrlValue = contact?.header_image_url || CONTACT_HEADER_PLACEHOLDER;
    const trustImageUrlValue = contact?.trust_image_url || defaultContact.trust_image_url;

    if (contactForm) {
      contactForm.elements['contact-title'].value = titleValue;
      contactForm.elements['contact-description'].value = descriptionValue;
      if (contactForm.elements['contact-about-title']) {
        contactForm.elements['contact-about-title'].value = aboutTitleValue;
      }
      contactForm.elements['contact-hours'].value = hoursValue;
      contactForm.elements['contact-email'].value = emailValue;
      contactForm.elements['contact-phone'].value = phoneValue;
      if (contactForm.elements['contact-whatsapp']) {
        contactForm.elements['contact-whatsapp'].value = whatsappValue;
      }
      contactForm.elements['contact-address'].value = addressValue;
      contactForm.elements['contact-lat'].value = latValue;
      contactForm.elements['contact-lng'].value = lngValue;
      if (contactForm.elements['contact-vision']) {
        contactForm.elements['contact-vision'].value = visionValue;
      }
      if (contactForm.elements['contact-mission']) {
        contactForm.elements['contact-mission'].value = missionValue;
      }
      if (contactForm.elements['contact-trust-score']) {
        contactForm.elements['contact-trust-score'].value = trustScoreValue;
      }
      if (contactForm.elements['contact-review']) {
        contactForm.elements['contact-review'].value = reviewValue;
      }
      if (contactForm.elements['contact-about']) {
        contactForm.elements['contact-about'].value = aboutValue;
      }
      if (contactHeaderImagePreview) {
        contactHeaderImagePreview.src = headerImageUrlValue || CONTACT_HEADER_PLACEHOLDER;
      }
      if (contactHeaderImageInput) {
        contactHeaderImageInput.value = '';
      }
      if (contactTrustImagePreview) {
        contactTrustImagePreview.src = trustImageUrlValue || defaultContact.trust_image_url;
      }
      if (contactTrustImageInput) {
        contactTrustImageInput.value = '';
      }
      contactHeaderImageDataUrl = null;
      contactTrustImageDataUrl = null;
    }
  };

  const renderUsers = () => {
    if (userCountNode) userCountNode.textContent = `${users.length} User`;
    if (!userListNode) return;
    userListNode.innerHTML = users
      .map((user) => `
        <li class="flex items-start justify-between py-3">
          <div>
            <p class="font-semibold text-slate-900">${user.name}</p>
            <p class="text-sm text-slate-500">${user.email}</p>
            <p class="text-xs text-slate-400 mt-1">${user.role || DEFAULT_USER_ROLE}</p>
          </div>
          <div class="flex gap-2 text-xs">
            <button class="px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition" data-user-action="edit" data-user-id="${user.id}">Edit</button>
            <button class="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition" data-user-action="delete" data-user-id="${user.id}">Delete</button>
          </div>
        </li>
      `)
      .join('');
  };

  const renderCustomerTrips = () => {
    const filtersActive = isCustomerTripFilterActive();
    if (customerTripTotalNode) customerTripTotalNode.textContent = filtersActive ? `${customerTrips.length} Booking (filtered)` : `${customerTrips.length} Booking`;
    if (!customerTripTableBody) return;
    if (!customerTrips.length) {
      customerTripTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-4 px-3 text-center text-slate-400">Belum ada catatan booking</td>
        </tr>
      `;
      return;
    }

    customerTripTableBody.innerHTML = customerTrips
      .map((trip) => {
        const statusLabel = getCustomerTripStatusLabel(trip.status);
        const statusClass = getCustomerTripStatusClasses(trip.status);
        const bookingCode = (trip.kode_booking || '').toUpperCase();
        return `
        <tr>
          <td class="py-3 px-3">
            <p class="font-semibold text-slate-900">${trip.nama}</p>
          </td>
          <td class="py-3 px-3">
            <span class="text-xs font-semibold px-3 py-1 rounded-full inline-flex ${statusClass}">${statusLabel}</span>
          </td>
          <td class="py-3 px-3 font-semibold text-slate-900">${bookingCode || '-'}</td>
          <td class="py-3 px-3">
            <div class="flex justify-end gap-2 text-xs">
              <button class="px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition" data-customer-trip-action="edit" data-customer-trip-id="${trip.id}">Edit</button>
              <button class="px-3 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition" data-customer-trip-action="delete" data-customer-trip-id="${trip.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  };

  let contactStatusTimer = null;
  let customerTripStatusTimer = null;

  const showContactStatus = (message, type = 'success') => {
    if (!contactStatus) return;
    const successClasses = ['text-emerald-600', 'bg-emerald-50', 'border-emerald-200'];
    const errorClasses = ['text-red-600', 'bg-red-50', 'border-red-200'];
    contactStatus.textContent = message;
    contactStatus.classList.remove('hidden', ...successClasses, ...errorClasses);
    contactStatus.classList.remove('hidden');
    const classesToAdd = type === 'success' ? successClasses : errorClasses;
    classesToAdd.forEach((cls) => contactStatus.classList.add(cls));
    if (contactStatusTimer) {
      clearTimeout(contactStatusTimer);
    }
    contactStatusTimer = window.setTimeout(() => {
      contactStatus.classList.add('hidden');
    }, 3200);
  };

  const showCustomerTripStatus = (message, type = 'success') => {
    if (!customerTripFormStatus) return;
    const successClasses = ['text-emerald-600', 'bg-emerald-50', 'border-emerald-200'];
    const errorClasses = ['text-red-600', 'bg-red-50', 'border-red-200'];
    customerTripFormStatus.textContent = message;
    customerTripFormStatus.classList.remove('hidden', ...successClasses, ...errorClasses);
    const classesToAdd = type === 'error' ? errorClasses : successClasses;
    classesToAdd.forEach((cls) => customerTripFormStatus.classList.add(cls));
    if (customerTripStatusTimer) {
      clearTimeout(customerTripStatusTimer);
    }
    customerTripStatusTimer = window.setTimeout(() => {
      customerTripFormStatus.classList.add('hidden');
    }, 3200);
  };

  const loadContact = async () => {
    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'GET',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat informasi lokasi');
      }
      if (data.data) {
        contact = { ...defaultContact, ...data.data };
        renderContact();
      }
    } catch (error) {
      console.warn('Gagal memuat data lokasi:', error);
    }
  };

  const persistContact = async (payload) => {
    const response = await fetch(CONTACT_API_URL, {
      method: 'POST',
      headers: buildAuthHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.status === 401) {
      handleUnauthorized();
      return null;
    }
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Gagal menyimpan informasi lokasi');
    }
    return data.data || null;
  };

  const handleUnauthorized = () => {
    if (typeof MostycomAuth.clearSession === 'function') {
      MostycomAuth.clearSession();
    }
    window.location.href = 'login.html';
  };

  const buildAuthHeaders = (hasBody = false) => {
    const headers = {};
    if (hasBody) headers['Content-Type'] = 'application/json';
    const token = typeof MostycomAuth.getToken === 'function' ? MostycomAuth.getToken() : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const loadTrips = async () => {
    try {
      const response = await fetch(TRIP_API_INDEX, {
        method: 'GET',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat trip');
      }
      trips = Array.isArray(data.data) ? data.data.map((trip) => normalizeTripRecord(trip)) : [];
      renderTrips();
      renderDraftCount();
    } catch (error) {
      console.error('Gagal memuat trip:', error);
    }
  };

  const loadArticles = async () => {
    try {
      const response = await fetch(ARTICLE_API_INDEX, {
        method: 'GET',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat artikel');
      }
      articles = Array.isArray(data.data) ? data.data : [];
      renderArticles();
      renderDraftCount();
    } catch (error) {
      console.error('Gagal memuat artikel:', error);
    }
  };

  const loadTestimonials = async () => {
    try {
      const response = await fetch(TESTIMONIAL_API_INDEX, {
        method: 'GET',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat testimoni');
      }
      testimonials = Array.isArray(data.data) ? data.data : [];
      renderTestimonials();
    } catch (error) {
      console.error('Gagal memuat testimoni:', error);
    }
  };

  const loadFaqs = async () => {
    try {
      const response = await fetch(FAQ_API_INDEX, {
        method: 'GET',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat FAQ');
      }
      faqs = Array.isArray(data.data) ? data.data : [];
      renderFaqs();
    } catch (error) {
      console.error('Gagal memuat FAQ:', error);
    }
  };

  const loadCustomerTrips = async () => {
    try {
      const query = buildCustomerTripQuery();
      const response = await fetch(`${CUSTOMER_TRIP_API_INDEX}${query}`, {
        method: 'GET',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat customer trip');
      }
      customerTrips = Array.isArray(data.data) ? data.data : [];
      renderCustomerTrips();
      syncCustomerTripSearchForm();
    } catch (error) {
      console.error('Gagal memuat customer trip:', error);
    }
  };

  const deleteCustomerTrip = async (id) => {
    try {
      const response = await fetch(`${CUSTOMER_TRIP_API_ITEM}?id=${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus booking');
      }
      await loadCustomerTrips();
      if (String(editingCustomerTripId) === String(id)) {
        resetCustomerTripForm();
      }
      showCustomerTripStatus('Booking dihapus');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan saat menghapus booking.');
    }
  };

  const deleteTestimonial = async (id) => {
    try {
      const response = await fetch(`${TESTIMONIAL_API_ITEM}?id=${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus testimoni');
      }
      await loadTestimonials();
      if (String(editingTestimonialId) === String(id)) {
        resetTestimonialForm();
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan saat menghapus testimoni.');
    }
  };

  const deleteFaq = async (id) => {
    try {
      const response = await fetch(`${FAQ_API_ITEM}?id=${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus FAQ');
      }
      await loadFaqs();
      if (String(editingFaqId) === String(id)) {
        resetFaqForm();
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan saat menghapus FAQ.');
    }
  };

  const deleteArticle = async (id) => {
    try {
      const response = await fetch(`${ARTICLE_API_ITEM}?id=${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus artikel');
      }
      await loadArticles();
      if (String(editingArticleId) === String(id)) {
        resetArticleForm();
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan saat menghapus artikel.');
    }
  };

  const deleteTrip = async (id) => {
    try {
      const response = await fetch(`${TRIP_API_ITEM}?id=${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus trip');
      }
      await loadTrips();
      if (String(editingTripId) === String(id)) {
        resetTripForm();
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan saat menghapus trip.');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(USER_API_INDEX, {
        method: 'GET',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal memuat user');
      }
      users = Array.isArray(data.data) ? data.data : [];
      renderUsers();
    } catch (error) {
      console.error('Gagal memuat user:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${USER_API_ITEM}?id=${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders()
      });
      const data = await response.json();
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gagal menghapus user');
      }
      await loadUsers();
      if (String(editingUserId) === String(id)) {
        resetUserForm();
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan saat menghapus user.');
    }
  };

  renderArticles();
  renderDraftCount();
  renderContact();
  renderUsers();
  renderTestimonials();
  renderFaqs();
  renderCustomerTrips();
  loadTrips();
  loadArticles();
  loadTestimonials();
  loadFaqs();
  loadCustomerTrips();
  loadContact();
  loadUsers();

  const resetTripForm = () => {
    editingTripId = null;
    if (tripForm) tripForm.reset();
    if (tripImageInput) tripImageInput.value = '';
    if (tripSaveBtn) tripSaveBtn.textContent = 'Simpan Trip';
    if (tripCancelBtn) tripCancelBtn.classList.add('hidden');
    initializeRouteDrafts();
    initializePhotoDrafts();
  };

  const resetArticleForm = () => {
    editingArticleId = null;
    if (articleForm) articleForm.reset();
    if (articleImagePreview) articleImagePreview.src = ARTICLE_PLACEHOLDER;
    if (articleImageInput) articleImageInput.value = '';
    articleImageDataUrl = null;
    if (articleSaveBtn) articleSaveBtn.textContent = 'Simpan Artikel';
    if (articleCancelBtn) articleCancelBtn.classList.add('hidden');
  };

  const resetUserForm = () => {
    editingUserId = null;
    if (userForm) userForm.reset();
    if (userSaveBtn) userSaveBtn.textContent = 'Simpan User';
    if (userCancelBtn) userCancelBtn.classList.add('hidden');
  };

  const resetCustomerTripForm = () => {
    editingCustomerTripId = null;
    if (customerTripForm) customerTripForm.reset();
    if (customerTripSaveBtn) customerTripSaveBtn.textContent = 'Simpan Booking';
    if (customerTripCancelBtn) customerTripCancelBtn.classList.add('hidden');
    if (customerTripFormStatus) customerTripFormStatus.classList.add('hidden');
  };

  const resetTestimonialForm = () => {
    editingTestimonialId = null;
    if (testimonialForm) testimonialForm.reset();
    if (testimonialSaveBtn) testimonialSaveBtn.textContent = 'Simpan Testimoni';
    if (testimonialCancelBtn) testimonialCancelBtn.classList.add('hidden');
    if (testimonialImagePreview) testimonialImagePreview.src = TESTIMONIAL_IMAGE_PLACEHOLDER;
    if (testimonialImageInput) testimonialImageInput.value = '';
    testimonialImageDataUrl = null;
  };

  const resetFaqForm = () => {
    editingFaqId = null;
    if (faqForm) faqForm.reset();
    if (faqSaveBtn) faqSaveBtn.textContent = 'Simpan FAQ';
    if (faqCancelBtn) faqCancelBtn.classList.add('hidden');
  };

  const startUserEdit = (user) => {
    if (!userForm) return;
    editingUserId = String(user.id);
    userForm.elements['user-name'].value = user.name || '';
    userForm.elements['user-email'].value = user.email || '';
    userForm.elements['user-password'].value = '';
    if (userSaveBtn) userSaveBtn.textContent = 'Update User';
    if (userCancelBtn) userCancelBtn.classList.remove('hidden');
  };

  const startTripEdit = (trip) => {
    if (!tripForm) return;
    const normalizedTrip = normalizeTripRecord(trip);
    editingTripId = normalizedTrip.id;
    tripForm.elements['trip-title'].value = normalizedTrip.nama_trip || '';
    tripForm.elements['trip-destination'].value = normalizedTrip.destinasi || '';
    tripForm.elements['trip-schedule'].value = normalizedTrip.jadwal || '';
    tripForm.elements['trip-status'].value = normalizedTrip.status || 'Draft';
    if (tripForm.elements['trip-terms']) {
      tripForm.elements['trip-terms'].value = normalizedTrip.terms || '';
    }
    if (tripForm.elements['trip-visa']) {
      tripForm.elements['trip-visa'].value = normalizedTrip.term_visa || '';
    }
    if (tripForm.elements['trip-notes']) {
      tripForm.elements['trip-notes'].value = normalizedTrip.catatan_trip || '';
    }
    if (tripSaveBtn) tripSaveBtn.textContent = 'Update Trip';
    if (tripCancelBtn) tripCancelBtn.classList.remove('hidden');
    if (tripImageInput) tripImageInput.value = '';
    initializeRouteDrafts(normalizedTrip.routes);
    const photoDrafts = Array.isArray(normalizedTrip.photos) && normalizedTrip.photos.length
      ? normalizedTrip.photos
      : (normalizedTrip.gambar_url ? [{ photo_full_url: normalizedTrip.gambar_url, is_primary: true }] : []);
    initializePhotoDrafts(photoDrafts);
  };

  const startArticleEdit = (article) => {
    if (!articleForm) return;
    editingArticleId = article.id;
    articleForm.elements['article-title'].value = article.judul || '';
    articleForm.elements['article-category'].value = article.kategori || '';
    articleForm.elements['article-status'].value = article.status || 'draft';
    articleForm.elements['article-content'].value = article.isi || '';
    if (articleImagePreview) articleImagePreview.src = article.gambar_url || ARTICLE_PLACEHOLDER;
    if (articleSaveBtn) articleSaveBtn.textContent = 'Update Artikel';
    if (articleCancelBtn) articleCancelBtn.classList.remove('hidden');
    if (articleImageInput) articleImageInput.value = '';
    articleImageDataUrl = null;
  };

  const startCustomerTripEdit = (trip) => {
    if (!customerTripForm) return;
    editingCustomerTripId = trip.id;
    const bookingField = customerTripForm.elements['customer-booking'];
    const statusField = customerTripForm.elements['customer-status'];
    customerTripForm.elements['customer-name'].value = trip.nama || '';
    if (bookingField) bookingField.value = (trip.kode_booking || '').toUpperCase();
    if (statusField) {
      const statusValue = (trip.status || 'pending').toLowerCase();
      statusField.value = CUSTOMER_TRIP_STATUS_LABELS[statusValue] ? statusValue : 'pending';
    }
    if (customerTripSaveBtn) customerTripSaveBtn.textContent = 'Update Booking';
    if (customerTripCancelBtn) customerTripCancelBtn.classList.remove('hidden');
    if (customerTripFormStatus) customerTripFormStatus.classList.add('hidden');
  };

  const startTestimonialEdit = (testimonial) => {
    if (!testimonialForm) return;
    editingTestimonialId = testimonial.id;
    testimonialForm.elements['testimonial-name'].value = testimonial.nama || '';
    testimonialForm.elements['testimonial-content'].value = testimonial.isi || '';
    testimonialForm.elements['testimonial-rate'].value = testimonial.rate || '5';
    if (testimonialSaveBtn) testimonialSaveBtn.textContent = 'Update Testimoni';
    if (testimonialCancelBtn) testimonialCancelBtn.classList.remove('hidden');
    if (testimonialImagePreview) testimonialImagePreview.src = testimonial.image_url || TESTIMONIAL_IMAGE_PLACEHOLDER;
    if (testimonialImageInput) testimonialImageInput.value = '';
    testimonialImageDataUrl = null;
  };

  const startFaqEdit = (faq) => {
    if (!faqForm) return;
    editingFaqId = faq.id;
    faqForm.elements['faq-title'].value = faq.judul || '';
    faqForm.elements['faq-content'].value = faq.isi || '';
    if (faqSaveBtn) faqSaveBtn.textContent = 'Update FAQ';
    if (faqCancelBtn) faqCancelBtn.classList.remove('hidden');
  };

  if (tripCancelBtn) {
    tripCancelBtn.addEventListener('click', () => {
      resetTripForm();
    });
  }

  if (articleCancelBtn) {
    articleCancelBtn.addEventListener('click', () => {
      resetArticleForm();
    });
  }

  if (userCancelBtn) {
    userCancelBtn.addEventListener('click', () => {
      resetUserForm();
    });
  }

  if (customerTripCancelBtn) {
    customerTripCancelBtn.addEventListener('click', () => {
      resetCustomerTripForm();
    });
  }

  if (testimonialCancelBtn) {
    testimonialCancelBtn.addEventListener('click', () => {
      resetTestimonialForm();
    });
  }

  if (faqCancelBtn) {
    faqCancelBtn.addEventListener('click', () => {
      resetFaqForm();
    });
  }

  if (customerTripSearchForm) {
    customerTripSearchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(customerTripSearchForm);
      customerTripFilters.nama = (formData.get('customer-search-name') || '').toString().trim();
      customerTripFilters.kode_booking = (formData.get('customer-search-booking') || '').toString().trim().toUpperCase();
      customerTripFilters.status = (formData.get('customer-search-status') || '').toString().trim().toLowerCase();
      await loadCustomerTrips();
    });
  }

  if (customerTripSearchResetBtn) {
    customerTripSearchResetBtn.addEventListener('click', async () => {
      customerTripFilters.nama = '';
      customerTripFilters.kode_booking = '';
      customerTripFilters.status = '';
      if (customerTripSearchForm) {
        customerTripSearchForm.reset();
      }
      await loadCustomerTrips();
    });
  }

  if (tripImageInput) {
    tripImageInput.addEventListener('change', async () => {
      try {
        await addTripPhotosFromFiles(tripImageInput.files);
      } catch (error) {
        console.warn(error);
        alert('Gagal membaca file foto. Pastikan format gambar valid lalu coba lagi.');
      } finally {
        tripImageInput.value = '';
      }
    });
  }

  if (articleImageInput && articleImagePreview) {
    articleImageInput.addEventListener('change', async () => {
      const file = articleImageInput.files[0];
      if (!file) {
        articleImagePreview.src = ARTICLE_PLACEHOLDER;
        articleImageDataUrl = null;
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        articleImagePreview.src = dataUrl;
        articleImageDataUrl = dataUrl;
      } catch (error) {
        console.warn(error);
        articleImagePreview.src = ARTICLE_PLACEHOLDER;
        articleImageDataUrl = null;
      }
    });
  }

  if (testimonialImageInput && testimonialImagePreview) {
    testimonialImageInput.addEventListener('change', async () => {
      const file = testimonialImageInput.files[0];
      if (!file) {
        testimonialImagePreview.src = TESTIMONIAL_IMAGE_PLACEHOLDER;
        testimonialImageDataUrl = null;
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        testimonialImagePreview.src = dataUrl;
        testimonialImageDataUrl = dataUrl;
      } catch (error) {
        console.warn(error);
        testimonialImagePreview.src = TESTIMONIAL_IMAGE_PLACEHOLDER;
        testimonialImageDataUrl = null;
      }
    });
  }

  if (contactHeaderImageInput && contactHeaderImagePreview) {
    contactHeaderImageInput.addEventListener('change', async () => {
      const file = contactHeaderImageInput.files[0];
      if (!file) {
        contactHeaderImagePreview.src = contact?.header_image_url || CONTACT_HEADER_PLACEHOLDER;
        contactHeaderImageDataUrl = null;
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        contactHeaderImagePreview.src = dataUrl;
        contactHeaderImageDataUrl = dataUrl;
      } catch (error) {
        console.warn(error);
        contactHeaderImagePreview.src = contact?.header_image_url || CONTACT_HEADER_PLACEHOLDER;
        contactHeaderImageDataUrl = null;
      }
    });
  }

  if (contactTrustImageInput && contactTrustImagePreview) {
    contactTrustImageInput.addEventListener('change', async () => {
      const file = contactTrustImageInput.files[0];
      if (!file) {
        contactTrustImagePreview.src = contact?.trust_image_url || defaultContact.trust_image_url;
        contactTrustImageDataUrl = null;
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        contactTrustImagePreview.src = dataUrl;
        contactTrustImageDataUrl = dataUrl;
      } catch (error) {
        console.warn(error);
        contactTrustImagePreview.src = contact?.trust_image_url || defaultContact.trust_image_url;
        contactTrustImageDataUrl = null;
      }
    });
  }

  if (invoiceAddItemBtn) {
    invoiceAddItemBtn.addEventListener('click', () => {
      invoiceDraft.items.push(createEmptyInvoiceItem(`Item ${invoiceDraft.items.length + 1}`, 1, 0));
      renderInvoiceItemsForm();
      renderInvoicePreview(true);
    });
  }

  if (invoiceItemsContainer) {
    invoiceItemsContainer.addEventListener('input', (event) => {
      const target = event.target;
      const field = target.dataset.invoiceField;
      const index = Number(target.dataset.invoiceIndex);
      if (!field || Number.isNaN(index) || !invoiceDraft.items[index]) return;
      const value = target.value;
      if (field === 'qty' || field === 'price') {
        invoiceDraft.items[index][field] = Number.isFinite(Number(value)) ? Number(value) : 0;
        updateInvoiceLineTotal(index);
      } else {
        invoiceDraft.items[index][field] = value;
      }
      renderInvoicePreview();
    });

    invoiceItemsContainer.addEventListener('click', (event) => {
      const button = event.target.closest('[data-invoice-item-remove]');
      if (!button) return;
      const index = Number(button.dataset.invoiceItemRemove);
      if (Number.isNaN(index)) return;
      invoiceDraft.items.splice(index, 1);
      renderInvoiceItemsForm();
      renderInvoicePreview(true);
    });
  }

  if (invoiceForm) {
    const invoiceFieldMap = {
      'invoice-number': 'number',
      'invoice-date': 'issueDate',
      'invoice-client': 'client',
      'invoice-notes': 'notes',
      'invoice-from': 'fromName',
      'invoice-fx-rate': 'fxRate',
      'invoice-fx-rate-jpy': 'fxRateJpy',
      'invoice-total-usd': 'manualTotalUsd',
      'invoice-total-idr': 'manualTotalIdr',
      'invoice-total-jpy': 'manualTotalJpy'
    };
    const numericInvoiceFields = ['invoice-fx-rate', 'invoice-fx-rate-jpy', 'invoice-total-usd', 'invoice-total-idr', 'invoice-total-jpy'];

    invoiceForm.addEventListener('input', (event) => {
      const target = event.target;
      if (target.dataset.invoiceField) return;
      const mappedField = invoiceFieldMap[target.name];
      if (!mappedField) return;
      if (numericInvoiceFields.includes(target.name)) {
        invoiceDraft[mappedField] = parseMoneyInput(target.value);
      } else {
        if (target.name === 'invoice-from') {
          invoiceDraft.fromName = target.value || '';
          invoiceDraft.fromCompany = '';
        } else {
          invoiceDraft[mappedField] = target.value;
        }
      }
      renderInvoicePreview();
    });

    invoiceForm.addEventListener('submit', (event) => {
      event.preventDefault();
      renderInvoicePreview(true);
      showInvoiceFormStatus('Invoice diperbarui');
    });
  }

  if (invoiceDpToggle) {
    invoiceDpToggle.addEventListener('change', (event) => {
      invoiceDraft.dpEnabled = event.target.checked;
      if (!invoiceDraft.dpEnabled) {
        invoiceDraft.dpAmount = 0;
      }
      syncInvoiceDpUi();
      renderInvoicePreview(true);
      showInvoiceFormStatus(invoiceDraft.dpEnabled ? 'Down Payment diaktifkan' : 'Down Payment dimatikan');
    });
  }

  if (invoiceDpAmountInput) {
    invoiceDpAmountInput.addEventListener('input', (event) => {
      if (!invoiceDraft.dpEnabled) return;
      const value = parseMoneyInput(event.target.value);
      invoiceDraft.dpAmount = value >= 0 ? value : 0;
      renderInvoicePreview();
      syncInvoiceDpUi();
    });
  }

  // Tombol ambil kurs otomatis dihilangkan dari UI; jika masih ada di DOM lama, abaikan.

  if (invoiceResetBtn) {
    invoiceResetBtn.addEventListener('click', () => {
      resetInvoiceDraft();
    });
  }

  if (invoiceFetchRateBtn) {
    invoiceFetchRateBtn.addEventListener('click', async () => {
      const originalText = invoiceFetchRateBtn.textContent;
      invoiceFetchRateBtn.disabled = true;
      invoiceFetchRateBtn.textContent = 'Memuat kurs...';
      try {
        const { idr, idrPerJpy } = await fetchUsdRates();
        invoiceDraft.fxRate = idr;
        invoiceDraft.fxRateJpy = idrPerJpy;
        if (invoiceFxRateInput) invoiceFxRateInput.value = normalizeInputValue(idr);
        if (invoiceFxRateJpyInput) invoiceFxRateJpyInput.value = normalizeInputValue(idrPerJpy);
        if (invoiceRateUsdInput) invoiceRateUsdInput.value = '1';
        renderInvoicePreview(true);
        showInvoiceFormStatus('Kurs USD/IDR & JPY/IDR diperbarui');
      } catch (error) {
        console.error('Gagal mengambil kurs otomatis:', error);
        alert(error.message || 'Gagal mengunduh kurs otomatis.');
      } finally {
        invoiceFetchRateBtn.disabled = false;
        invoiceFetchRateBtn.textContent = originalText;
      }
    });
  }

  if (invoicePrintBtn) {
    invoicePrintBtn.addEventListener('click', () => {
      openInvoicePrint();
    });
  }

  if (invoicePdfBtn) {
    invoicePdfBtn.addEventListener('click', () => {
      openInvoicePrint();
    });
  }

  if (invoiceDownloadBtn) {
    invoiceDownloadBtn.addEventListener('click', async () => {
      if (invoiceDownloadBtn.disabled) return;
      const originalText = invoiceDownloadBtn.textContent;
      invoiceDownloadBtn.disabled = true;
      invoiceDownloadBtn.textContent = 'Menyiapkan...';
      try {
        await downloadInvoicePreviewPdf();
        showInvoicePreviewStatus('PDF diunduh');
      } catch (error) {
        console.error('Gagal mengunduh PDF invoice:', error);
        alert(error.message || 'Gagal mengunduh PDF invoice.');
      } finally {
        invoiceDownloadBtn.disabled = false;
        invoiceDownloadBtn.textContent = originalText;
      }
    });
  }

  if (tripForm) {
    tripForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(tripForm);
      const title = formData.get('trip-title').trim();
      const destination = formData.get('trip-destination').trim();
      const scheduleInput = formData.get('trip-schedule').trim();
      const statusValue = formData.get('trip-status');
      const termsValue = (formData.get('trip-terms') || '').toString().trim();
      const visaValue = (formData.get('trip-visa') || '').toString().trim();
      const notesValue = (formData.get('trip-notes') || '').toString().trim();

      if (!title) {
        alert('Nama trip wajib diisi.');
        return;
      }

      const payload = {
        nama_trip: title,
        destinasi: destination || '',
        jadwal: scheduleInput || '',
        status: (statusValue || 'draft').toLowerCase(),
        terms: termsValue,
        term_visa: visaValue,
        catatan_trip: notesValue
      };

      const routesPayload = buildRoutePayload();
      if (!routesPayload.length) {
        alert('Minimal 1 rute dengan nama harus diisi sebelum menyimpan trip.');
        return;
      }
      payload.routes = routesPayload;

      const photosPayload = buildTripPhotosPayload();
      if (!photosPayload.length) {
        alert('Minimal 1 foto destinasi harus diunggah.');
        return;
      }
      payload.photos = photosPayload;

      const isEdit = Boolean(editingTripId);
      const submitBtn = tripSaveBtn;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Memperbarui...' : 'Menyimpan...';
      }

      try {
        const response = await fetch(isEdit ? `${TRIP_API_ITEM}?id=${editingTripId}` : TRIP_API_INDEX, {
          method: isEdit ? 'PUT' : 'POST',
          headers: buildAuthHeaders(true),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Gagal menyimpan trip');
        }
        await loadTrips();
        resetTripForm();
      } catch (error) {
        console.error(error);
        alert(error.message || 'Terjadi kesalahan saat menyimpan trip.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = editingTripId ? 'Update Trip' : 'Simpan Trip';
        }
      }
    });
  }

  if (articleForm) {
    articleForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(articleForm);
      const title = formData.get('article-title').trim();
      const category = formData.get('article-category').trim();
      const statusInput = formData.get('article-status');
      const content = formData.get('article-content').trim();

      if (!title) {
        alert('Judul artikel wajib diisi.');
        return;
      }

      const payload = {
        judul: title,
        kategori: category || '',
        isi: content || '',
        status: (statusInput || 'draft').toLowerCase()
      };

      if (articleImageDataUrl) {
        payload.image_base64 = articleImageDataUrl;
      }

      const isEdit = Boolean(editingArticleId);
      const submitBtn = articleSaveBtn;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Memperbarui...' : 'Menyimpan...';
      }

      try {
        const response = await fetch(isEdit ? `${ARTICLE_API_ITEM}?id=${editingArticleId}` : ARTICLE_API_INDEX, {
          method: isEdit ? 'PUT' : 'POST',
          headers: buildAuthHeaders(true),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Gagal menyimpan artikel');
        }
        await loadArticles();
        resetArticleForm();
      } catch (error) {
        console.error(error);
        alert(error.message || 'Terjadi kesalahan saat menyimpan artikel.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = editingArticleId ? 'Update Artikel' : 'Simpan Artikel';
        }
      }
    });
  }

  if (userForm) {
    userForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(userForm);
      const name = (formData.get('user-name') || '').toString().trim();
      const email = (formData.get('user-email') || '').toString().trim().toLowerCase();
      const password = (formData.get('user-password') || '').toString().trim();
      const isEdit = Boolean(editingUserId);

      if (!name || !email || (!isEdit && !password)) {
        alert('Nama, email, dan password wajib diisi.');
        return;
      }

      const payload = {
        name,
        email,
        role: DEFAULT_USER_ROLE
      };
      if (password) {
        payload.password = password;
      }

      const submitBtn = userSaveBtn;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Memperbarui...' : 'Menyimpan...';
      }

      try {
        const response = await fetch(isEdit ? `${USER_API_ITEM}?id=${editingUserId}` : USER_API_INDEX, {
          method: isEdit ? 'PUT' : 'POST',
          headers: buildAuthHeaders(true),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Gagal menyimpan user');
        }
        await loadUsers();
        resetUserForm();
      } catch (error) {
        console.error(error);
        alert(error.message || 'Terjadi kesalahan saat menyimpan user.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = isEdit ? 'Update User' : 'Simpan User';
        }
      }
    });
  }

  if (testimonialForm) {
    testimonialForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(testimonialForm);
      const name = (formData.get('testimonial-name') || '').toString().trim();
      const content = (formData.get('testimonial-content') || '').toString().trim();
      const rate = parseInt((formData.get('testimonial-rate') || '5').toString(), 10);
      if (!name || !content) {
        alert('Nama dan isi testimoni wajib diisi.');
        return;
      }
      const payload = {
        nama: name,
        isi: content,
        rate: Number.isNaN(rate) ? 5 : rate
      };
      if (testimonialImageDataUrl) {
        payload.image_base64 = testimonialImageDataUrl;
      }
      const isEdit = Boolean(editingTestimonialId);
      const submitBtn = testimonialSaveBtn;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Memperbarui...' : 'Menyimpan...';
      }
      try {
        const response = await fetch(isEdit ? `${TESTIMONIAL_API_ITEM}?id=${editingTestimonialId}` : TESTIMONIAL_API_INDEX, {
          method: isEdit ? 'PUT' : 'POST',
          headers: buildAuthHeaders(true),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Gagal menyimpan testimoni');
        }
        await loadTestimonials();
        resetTestimonialForm();
      } catch (error) {
        console.error(error);
        alert(error.message || 'Terjadi kesalahan saat menyimpan testimoni.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = editingTestimonialId ? 'Update Testimoni' : 'Simpan Testimoni';
        }
      }
    });
  }

  if (faqForm) {
    faqForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(faqForm);
      const title = (formData.get('faq-title') || '').toString().trim();
      const content = (formData.get('faq-content') || '').toString().trim();
      if (!title || !content) {
        alert('Judul dan jawaban FAQ wajib diisi.');
        return;
      }
      const payload = {
        judul: title,
        isi: content
      };
      const isEdit = Boolean(editingFaqId);
      const submitBtn = faqSaveBtn;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Memperbarui...' : 'Menyimpan...';
      }
      try {
        const response = await fetch(isEdit ? `${FAQ_API_ITEM}?id=${editingFaqId}` : FAQ_API_INDEX, {
          method: isEdit ? 'PUT' : 'POST',
          headers: buildAuthHeaders(true),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Gagal menyimpan FAQ');
        }
        await loadFaqs();
        resetFaqForm();
      } catch (error) {
        console.error(error);
        alert(error.message || 'Terjadi kesalahan saat menyimpan FAQ.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = editingFaqId ? 'Update FAQ' : 'Simpan FAQ';
        }
      }
    });
  }

  if (customerTripForm) {
    customerTripForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(customerTripForm);
      const name = (formData.get('customer-name') || '').toString().trim();
      const booking = (formData.get('customer-booking') || '').toString().trim().toUpperCase();
      const statusValue = (formData.get('customer-status') || 'pending').toString().toLowerCase();

      if (!name || !booking) {
        showCustomerTripStatus('Nama dan kode booking wajib diisi', 'error');
        return;
      }

      const payload = {
        nama: name,
        kode_booking: booking,
        status: statusValue
      };
      const isEdit = Boolean(editingCustomerTripId);
      const submitBtn = customerTripSaveBtn;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Memperbarui...' : 'Menyimpan...';
      }

      try {
        const response = await fetch(isEdit ? `${CUSTOMER_TRIP_API_ITEM}?id=${editingCustomerTripId}` : CUSTOMER_TRIP_API_INDEX, {
          method: isEdit ? 'PUT' : 'POST',
          headers: buildAuthHeaders(true),
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Gagal menyimpan booking');
        }
        await loadCustomerTrips();
        resetCustomerTripForm();
        showCustomerTripStatus(isEdit ? 'Booking diperbarui' : 'Booking tersimpan');
      } catch (error) {
        console.error(error);
        showCustomerTripStatus(error.message || 'Terjadi kesalahan saat menyimpan booking.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = editingCustomerTripId ? 'Update Booking' : 'Simpan Booking';
        }
      }
    });
  }

  if (contactForm) {
    const contactSubmitBtn = contactForm.querySelector('button[type="submit"]');
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const getValue = (name) => {
        const value = formData.get(name);
        return typeof value === 'string' ? value.trim() : '';
      };

      const payload = {
        id: contact?.id || undefined,
        title: getValue('contact-title'),
        description: getValue('contact-description'),
        hours: getValue('contact-hours'),
        email: getValue('contact-email'),
        phone: getValue('contact-phone'),
        whatsapp: getValue('contact-whatsapp'),
        address: getValue('contact-address'),
        lat: getValue('contact-lat'),
        lng: getValue('contact-lng'),
        vision: getValue('contact-vision'),
        mission: getValue('contact-mission'),
        trust_score: getValue('contact-trust-score'),
        review: getValue('contact-review'),
        header_image: contact?.header_image || '',
        trust_image: contact?.trust_image || '',
        about: getValue('contact-about'),
        about_title: getValue('contact-about-title')
      };
      if (contactHeaderImageDataUrl) {
        payload.header_image_base64 = contactHeaderImageDataUrl;
      }
      if (contactTrustImageDataUrl) {
        payload.trust_image_base64 = contactTrustImageDataUrl;
      }

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.textContent = 'Menyimpan...';
      }

      try {
        const updated = await persistContact(payload);
        if (updated) {
          contact = { ...defaultContact, ...updated };
          renderContact();
        }
        if (updated !== null) {
          showContactStatus('Informasi lokasi tersimpan.');
        }
      } catch (error) {
        console.error('Gagal menyimpan kontak:', error);
        showContactStatus(error.message || 'Gagal menyimpan informasi lokasi.', 'error');
      } finally {
        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.textContent = 'Simpan Info Lokasi';
        }
      }
    });
  }
  if (articleListNode) {
    articleListNode.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-article-action]');
      if (!button) return;
      const action = button.dataset.articleAction;
      const id = button.dataset.articleId;
      if (!id) return;
      const currentArticle = articles.find((article) => String(article.id) === String(id));
      if (action === 'edit' && currentArticle) {
        startArticleEdit(currentArticle);
        setActiveSection('article-manager');
      } else if (action === 'delete') {
        if (!confirm('Hapus artikel ini dari CMS?')) return;
        await deleteArticle(id);
      }
    });
  }

  if (customerTripTableBody) {
    customerTripTableBody.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-customer-trip-action]');
      if (!button) return;
      const action = button.dataset.customerTripAction;
      const id = button.dataset.customerTripId;
      if (!id) return;
      const currentTrip = customerTrips.find((trip) => String(trip.id) === String(id));
      if (action === 'edit' && currentTrip) {
        startCustomerTripEdit(currentTrip);
        setActiveSection('customer-trips');
      } else if (action === 'delete') {
        if (!confirm('Hapus booking ini dari log customer?')) return;
        await deleteCustomerTrip(id);
      }
    });
  }

  if (userListNode) {
    userListNode.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-user-action]');
      if (!button) return;
      const action = button.dataset.userAction;
      const id = button.dataset.userId;
      if (!id) return;
      const currentUser = users.find((user) => String(user.id) === String(id));
      if (action === 'edit' && currentUser) {
        startUserEdit(currentUser);
        setActiveSection('user-manager');
      } else if (action === 'delete') {
        if (!confirm('Hapus user ini? User tidak akan bisa login lagi.')) return;
        await deleteUser(id);
      }
    });
  }

  if (tripListNode) {
    tripListNode.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-trip-action]');
      if (!button) return;
      const action = button.dataset.tripAction;
      const id = button.dataset.tripId;
      if (!id) return;
      const currentTrip = trips.find((trip) => String(trip.id) === String(id));
      if (action === 'edit' && currentTrip) {
        startTripEdit(currentTrip);
        setActiveSection('trip-manager');
      } else if (action === 'delete') {
        if (!confirm('Hapus trip ini dari CMS?')) return;
        await deleteTrip(id);
      }
    });
  }

  if (testimonialListNode) {
    testimonialListNode.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-testimonial-action]');
      if (!button) return;
      const action = button.dataset.testimonialAction;
      const id = button.dataset.testimonialId;
      if (!id) return;
      const current = testimonials.find((row) => String(row.id) === String(id));
      if (action === 'edit' && current) {
        startTestimonialEdit(current);
        setActiveSection('testimonial-manager');
      } else if (action === 'delete') {
        if (!confirm('Hapus testimoni ini dari daftar?')) return;
        await deleteTestimonial(id);
      }
    });
  }

  if (faqListNode) {
    faqListNode.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-faq-action]');
      if (!button) return;
      const action = button.dataset.faqAction;
      const id = button.dataset.faqId;
      if (!id) return;
      const current = faqs.find((faq) => String(faq.id) === String(id));
      if (action === 'edit' && current) {
        startFaqEdit(current);
        setActiveSection('faq-manager');
      } else if (action === 'delete') {
        if (!confirm('Hapus FAQ ini dari daftar?')) return;
        await deleteFaq(id);
      }
    });
  }
});











