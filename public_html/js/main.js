document.addEventListener('DOMContentLoaded', () => {
  const PUBLIC_API_BASE = window.LANDING_API_BASE_URL || '/public/api';
  const PUBLIC_TRIP_API_ENDPOINTS = [
    `${PUBLIC_API_BASE}/trips/index.php`,
  ];
  const PUBLIC_ARTICLE_API_ENDPOINTS = [
    `${PUBLIC_API_BASE}/articles/index.php`,
  ];
  const PUBLIC_CONTACT_API_ENDPOINTS = [
    `${PUBLIC_API_BASE}/contact/index.php`,
  ];
  const PUBLIC_TESTIMONIAL_API_ENDPOINTS = [
    `${PUBLIC_API_BASE}/testimonials/index.php`,
  ];
  const PUBLIC_FAQ_API_ENDPOINTS = [
    `${PUBLIC_API_BASE}/faqs/index.php`,
  ];
  const PUBLIC_TRACKING_API_ENDPOINT = `${PUBLIC_API_BASE}/customer-trips/index.php`;
  const TRIP_PLACEHOLDER = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80';
  const ARTICLE_PLACEHOLDER = 'https://images.unsplash.com/photo-1500534627634-84ae356eb3b3?auto=format&fit=crop&w=900&q=80';
  const CONTACT_HEADER_PLACEHOLDER = 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80';
  const CONTACT_TRUST_PLACEHOLDER = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=200&q=80';
  const TESTIMONIAL_IMAGE_PLACEHOLDER = 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80';
  const WA_DEFAULT_NUMBER = '6281234567890';
  const WA_DEFAULT_MESSAGE = 'Halo MOSTYCOM saya ingin tanya trip';
  const BOOKING_WHATSAPP_PHONE = '628110000012';
  const DEFAULT_MISSION_ITEMS = [
    'Menghadirkan itinerary personalisasi berbasis data dan preferensi traveler.',
    'Memberdayakan local guide & komunitas destinasi.',
    'Menyediakan teknologi tracking yang transparan dan real time.'
  ];
  const DEFAULT_TRIP_DESC = 'Hubungi tim MOSTYCOM untuk mendapatkan itinerary lengkap dan detail harga.';

  const state = {
    trips: [],
    articles: [],
    contact: null,
    testimonials: [],
    faqs: [],
    regionFilter: 'all'
  };
  let testimonialSliderController = null;
  let activeTrip = null;
  let activeRouteKey = null;
  let activeScheduleKey = null;
  let pendingBookingInfo = null;

  const heroBackgroundImage = document.getElementById('hero-background-image');
  const aboutTitleNode = document.getElementById('about-title');
  const aboutDescriptionNode = document.getElementById('about-description');
  const aboutAddressNode = document.getElementById('about-address');
  const aboutEmailNode = document.getElementById('about-email');
  const aboutPhoneNode = document.getElementById('about-phone');
  const aboutWhatsappNode = document.getElementById('about-whatsapp');
  const tripGrid = document.getElementById('trip-grid');
  const tripEmptyState = document.getElementById('trip-empty-state');
  const articleGrid = document.getElementById('article-grid');
  const articleEmptyState = document.getElementById('article-empty-state');
  const contactTitle = document.getElementById('contact-title');
  const contactDescription = document.getElementById('contact-description');
  const contactHours = document.getElementById('contact-hours');
  const contactEmail = document.getElementById('contact-email');
  const contactPhone = document.getElementById('contact-phone');
  const contactWhatsapp = document.getElementById('contact-whatsapp');
  const contactAddress = document.getElementById('contact-address');
  const contactSection = document.getElementById('contact');
  const contactMapElement = document.getElementById('contact-map');
  const visionText = document.getElementById('vision-text');
  const missionList = document.getElementById('mission-list');
  const trustScoreValue = document.getElementById('trust-score-value');
  const trustReviewText = document.getElementById('trust-review-text');
  const trustImageNode = document.getElementById('trust-image');
  const whatsappFloatingLink = document.getElementById('whatsapp-floating-link');

  const tripModal = document.getElementById('trip-modal');
  const tripModalClose = document.getElementById('trip-modal-close');
  const modalTripImage = document.getElementById('modal-trip-image');
  const modalTripTitle = document.getElementById('modal-trip-title');
  const modalTripLocation = document.getElementById('modal-trip-location');
  const modalTripPrice = document.getElementById('modal-trip-price');
  const modalTripDuration = document.getElementById('modal-trip-duration');
  const modalTripDesc = document.getElementById('modal-trip-desc');
  const modalTripHighlights = document.getElementById('modal-trip-highlights');
  const modalCTA = document.getElementById('modal-cta');
  const modalTripTerms = document.getElementById('modal-trip-terms');
  const modalTripVisa = document.getElementById('modal-trip-visa');
  const modalTripNotes = document.getElementById('modal-trip-notes');
  const modalTripRoutes = document.getElementById('modal-trip-routes');
  const tripDetailView = document.getElementById('trip-detail-view');
  const tripBookingView = document.getElementById('trip-booking-view');
  const tripBookingBackBtn = document.getElementById('trip-booking-back');
  const tripBookingForm = document.getElementById('trip-booking-form');
  const tripBookingRouteSelect = document.getElementById('trip-booking-route');
  const tripBookingScheduleSelect = document.getElementById('trip-booking-schedule');
  const tripBookingNameInput = document.getElementById('trip-booking-name');
  const tripBookingPhoneInput = document.getElementById('trip-booking-phone');
  const tripBookingPaxInput = document.getElementById('trip-booking-pax');
  const tripBookingNoteInput = document.getElementById('trip-booking-note');
  const tripBookingPassengers = document.getElementById('trip-booking-passengers');
  const tripBookingSummary = document.getElementById('trip-booking-summary');
  const bookingInvoiceOverlay = document.getElementById('trip-booking-invoice');
  const bookingInvoiceClose = document.getElementById('trip-booking-invoice-close');
  const bookingInvoiceConfirm = document.getElementById('trip-booking-invoice-confirm');
  const bookingInvoiceCancel = document.getElementById('trip-booking-invoice-cancel');
  const bookingInvoiceTripTitle = document.getElementById('invoice-trip-title');
  const bookingInvoiceRouteLabel = document.getElementById('invoice-route-label');
  const bookingInvoiceSchedule = document.getElementById('invoice-schedule');
  const bookingInvoicePax = document.getElementById('invoice-pax');
  const bookingInvoicePrice = document.getElementById('invoice-price');
  const bookingInvoiceTotal = document.getElementById('invoice-total');
  const bookingInvoiceNote = document.getElementById('invoice-note');

  const articleModal = document.getElementById('article-modal');
  const articleModalClose = document.getElementById('article-modal-close');
  const articleModalImage = document.getElementById('article-modal-image');
  const articleModalTitle = document.getElementById('article-modal-title');
  const articleModalDate = document.getElementById('article-modal-date');
  const articleModalDesc = document.getElementById('article-modal-desc');
  const articleModalBody = document.getElementById('article-modal-body');
  const articleModalCTA = document.getElementById('article-modal-cta');
  const testimonialEmptyState = document.getElementById('testimonial-empty');
  const faqListContainer = document.getElementById('faq-list');
const faqEmptyState = document.getElementById('faq-empty-state');

let contactMap = null;
let contactMarker = null;

  const lockBodyScroll = () => document.body.classList.add('overflow-hidden');
  const releaseBodyScroll = () => {
    if (
      tripModal.classList.contains('hidden') &&
      articleModal.classList.contains('hidden')
    ) {
      document.body.classList.remove('overflow-hidden');
    }
  };

  const applyStaticClasses = () => {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.add(
        'px-4',
        'py-2',
        'rounded-full',
        'text-sm',
        'font-semibold',
        'border',
        'border-slate-200',
        'text-slate-500',
        'hover:text-white',
        'hover:bg-sky-500',
        'transition'
      );
    });
    document.querySelectorAll('.slider-btn').forEach((btn) => {
      btn.classList.add(
        'px-5',
        'py-2.5',
        'rounded-full',
        'border',
        'border-slate-200',
        'text-slate-600',
        'hover:bg-sky-500',
        'hover:text-white',
        'transition'
      );
    });
    document.querySelectorAll('.faq-item').forEach((item) => {
      item.classList.add('bg-slate-50', 'rounded-2xl', 'border', 'border-slate-100', 'overflow-hidden');
    });
    document.querySelectorAll('.faq-question').forEach((btn) => {
      btn.classList.add('w-full', 'text-left', 'px-6', 'py-4', 'font-semibold', 'text-slate-900', 'flex', 'justify-between', 'items-center');
      if (!btn.querySelector('span')) {
        btn.innerHTML += '<span class="text-slate-400">+</span>';
      }
    });
    document.querySelectorAll('.faq-answer').forEach((ans) => {
      ans.classList.add('px-6', 'pb-4', 'text-sm', 'text-slate-500', 'hidden');
    });
    document.querySelectorAll('.social-icon').forEach((icon) => {
      icon.classList.add('w-10', 'h-10', 'rounded-full', 'bg-slate-800', 'flex', 'items-center', 'justify-center', 'hover:bg-sky-500', 'transition');
    });
  };

  const styleTripCards = () => {
    document.querySelectorAll('.trip-card').forEach((card) => {
      card.classList.add('bg-white', 'rounded-3xl', 'overflow-hidden', 'shadow-lg', 'border', 'border-slate-100');
    });
    document.querySelectorAll('.trip-img').forEach((img) => {
      img.classList.add('w-full', 'h-48', 'object-cover');
    });
    document.querySelectorAll('.trip-btn').forEach((btn) => {
      btn.classList.add('mt-6', 'inline-flex', 'items-center', 'justify-center', 'w-full', 'rounded-2xl', 'bg-slate-900', 'text-white', 'font-semibold', 'py-2.5', 'hover:bg-sky-500', 'transition');
    });
  };

  const styleArticleCards = () => {
    document.querySelectorAll('.blog-card').forEach((card) => {
      card.classList.add('bg-white', 'rounded-3xl', 'overflow-hidden', 'shadow-lg', 'border', 'border-slate-100');
    });
    document.querySelectorAll('.blog-img').forEach((img) => {
      img.classList.add('w-full', 'h-48', 'object-cover');
    });
    document.querySelectorAll('.blog-btn').forEach((btn) => {
      btn.classList.add('mt-4', 'text-sm', 'font-semibold', 'text-sky-500', 'hover:text-sky-600', 'transition');
    });
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Gagal memuat data (${response.status})`);
    }
    return response.json();
  };

  const fetchWithFallback = async (endpoints) => {
    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        return await fetchJson(endpoint);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('Endpoint publik tidak tersedia');
  };

  const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTripSchedule = (value) => {
    const formatted = formatDate(value, { day: 'numeric', month: 'long', year: 'numeric' });
    return formatted || 'Jadwal menyusul';
  };

  const parsePriceToNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/[^\d]/g, '');
    return cleaned ? Number.parseInt(cleaned, 10) : 0;
  };

  const formatCurrency = (value) => {
    if (!value || Number.isNaN(value)) return 'Hubungi Kami';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderRichText = (element, value, fallback = '') => {
    if (!element) return;
    const source = value && String(value).trim() !== '' ? String(value).trim() : fallback;
    element.innerHTML = source ? source.replace(/\n/g, '<br>') : '<span class="text-slate-400 text-xs">Informasi akan segera tersedia.</span>';
  };

  const normalizeTripRecord = (trip, fallbackIndex = 0) => {
    if (!trip || typeof trip !== 'object') {
      return { routes: [] };
    }
    const tripKey = trip.id ?? fallbackIndex;
    const normalizedRoutes = (Array.isArray(trip.routes) ? trip.routes : []).map((route, routeIndex) => {
      const schedules = Array.isArray(route?.schedules) ? route.schedules : [];
      const routeKey = route.id ? String(route.id) : `trip-${tripKey}-route-${routeIndex}`;
      return {
        ...route,
        clientKey: routeKey,
        schedules: schedules.map((schedule, scheduleIndex) => ({
          ...schedule,
          clientKey: schedule.id ? String(schedule.id) : `${routeKey}-schedule-${scheduleIndex}`
        }))
      };
    });
    return {
      ...trip,
      routes: normalizedRoutes
    };
  };

  const formatScheduleLabel = (schedule) => {
    if (!schedule) return 'Jadwal menyusul';
    const start = formatDate(schedule.tanggal_mulai, { day: 'numeric', month: 'short', year: 'numeric' });
    const end = formatDate(schedule.tanggal_selesai, { day: 'numeric', month: 'short', year: 'numeric' });
    const baseLabel = end && end !== start ? `${start} - ${end}` : (start || 'Jadwal menyusul');
    const infoParts = [
      schedule.kuota ? `Kuota ${schedule.kuota}` : null,
      schedule.slot_tersedia ? `Slot ${schedule.slot_tersedia}` : null,
      schedule.status ? schedule.status.toUpperCase() : null
    ].filter(Boolean);
    return infoParts.length ? `${baseLabel} (${infoParts.join(' · ')})` : baseLabel;
  };

  const getSlotBadgeClass = (slotValue) => {
    if (Number.isNaN(slotValue) || slotValue === null || slotValue === undefined) {
      return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
    if (slotValue <= 0) {
      return 'bg-red-50 text-red-600 border border-red-100';
    }
    if (slotValue <= 5) {
      return 'bg-amber-50 text-amber-600 border border-amber-100';
    }
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  };

  const detectRegion = (text = '') => {
    const normalized = text.toLowerCase();
    const dictionary = {
      asia: ['asia', 'japan', 'tokyo', 'kyoto', 'bali', 'singapore', 'seoul', 'thailand', 'vietnam', 'jakarta'],
      eropa: ['eropa', 'europe', 'paris', 'zurich', 'swiss', 'switzerland', 'rome', 'london'],
      amerika: ['amerika', 'america', 'peru', 'chile', 'canada', 'usa', 'mexico', 'andes'],
      afrika: ['afrika', 'africa', 'tanzania', 'safari', 'namibia', 'morocco'],
      oceania: ['oceania', 'australia', 'zealand', 'sydney', 'melbourne', 'queenstown']
    };
    const region = Object.keys(dictionary).find((key) =>
      dictionary[key].some((keyword) => normalized.includes(keyword))
    );
    return region || 'all';
  };

  const normalizeWhatsappNumber = (value = '') => value.replace(/\D+/g, '');

  const buildWhatsappLink = (number) => {
    const digits = normalizeWhatsappNumber(number);
    if (!digits) return '';
    const encoded = encodeURIComponent(WA_DEFAULT_MESSAGE);
    return `https://wa.me/${digits}?text=${encoded}`;
  };

  const updateWhatsappFloatingLink = (number) => {
    if (!whatsappFloatingLink) return;
    const fallback = buildWhatsappLink(WA_DEFAULT_NUMBER) || whatsappFloatingLink.href || '#';
    const candidate = buildWhatsappLink(number);
    whatsappFloatingLink.href = candidate || fallback;
  };

  const createTripCardMarkup = (trip) => {
    const region = detectRegion(`${trip.destinasi || ''} ${trip.nama_trip || ''}`);
    const locationText = trip.destinasi || 'Destinasi akan diumumkan';
    const scheduleText = formatTripSchedule(trip.jadwal);
    const imageSrc = trip.gambar_url || TRIP_PLACEHOLDER;
    return `
      <article class="trip-card" data-region="${region}">
        <img src="${imageSrc}" alt="${trip.nama_trip || 'Trip MOSTYCOM'}" class="trip-img" />
        <div class="p-6">
          <h3 class="text-xl font-semibold text-slate-900">${trip.nama_trip || 'Trip MOSTYCOM'}</h3>
          <p class="text-sky-500 font-semibold mt-2">${locationText}</p>
          <div class="mt-3 text-sm text-slate-500 space-y-1">
            <p>Jadwal: ${scheduleText}</p>
            <p>Status: ${(trip.status || 'draft').toUpperCase()}</p>
          </div>
          <button class="trip-btn" data-trip-id="${trip.id}">Detail Trip</button>
        </div>
      </article>
    `;
  };

  const createArticleCardMarkup = (article) => {
    const imageSrc = article.gambar_url || ARTICLE_PLACEHOLDER;
    const snippet = (article.isi || '').slice(0, 110);
    const dateLabel = formatDate(article.created_at);
    return `
      <article class="blog-card">
        <img src="${imageSrc}" alt="${article.judul || 'Artikel MOSTYCOM'}" class="blog-img" />
        <div class="p-6">
          <p class="text-xs uppercase text-slate-400">${dateLabel || article.kategori || 'MOSTYCOM'}</p>
          <h3 class="text-lg font-semibold text-slate-900 mt-2">${article.judul || 'Artikel MOSTYCOM'}</h3>
          <p class="text-sm text-slate-500 mt-3">${snippet || 'Cerita perjalanan terbaru dari tim kami.'}${article.isi && article.isi.length > 110 ? '…' : ''}</p>
          <button class="blog-btn" data-article-id="${article.id}">Baca Selengkapnya</button>
        </div>
      </article>
    `;
  };

  const renderTrips = () => {
    if (!tripGrid) return;
    if (!state.trips.length) {
      tripGrid.innerHTML = '';
      tripEmptyState?.classList.remove('hidden');
      return;
    }
    tripEmptyState?.classList.add('hidden');
    tripGrid.innerHTML = state.trips.map(createTripCardMarkup).join('');
    styleTripCards();
    attachTripCardEvents();
    applyTripFilter(state.regionFilter, false);
  };

  const renderArticles = () => {
    if (!articleGrid) return;
    if (!state.articles.length) {
      articleGrid.innerHTML = '';
      articleEmptyState?.classList.remove('hidden');
      return;
    }
    articleEmptyState?.classList.add('hidden');
    articleGrid.innerHTML = state.articles.map(createArticleCardMarkup).join('');
    styleArticleCards();
    attachArticleCardEvents();
  };

  const renderMissionItems = (value) => {
    if (!missionList) return;
    const items = typeof value === 'string'
      ? value.split(/[\n;]+/).map((item) => item.trim()).filter((item) => item !== '')
      : [];
    const source = items.length ? items : DEFAULT_MISSION_ITEMS;
    if (!source.length) {
      missionList.innerHTML = '';
      return;
    }
    missionList.innerHTML = source.map((item) => `<li>${item}</li>`).join('');
  };

  const renderVissionItems = (value) => {
    if (!visionText) return;
    const items = typeof value === 'string'
      ? value.split(/[\n;]+/).map((item) => item.trim()).filter((item) => item !== '')
      : [];
    const source = items.length ? items : DEFAULT_MISSION_ITEMS;
    if (!source.length) {
      visionText.innerHTML = '';
      return;
    }
    visionText.innerHTML = source.map((item) => `<li>${item}</li>`).join('');
  };

  const renderTripRoutesList = (trip) => {
    if (!modalTripRoutes) return;
    const routes = Array.isArray(trip?.routes) ? trip.routes : [];
    if (!routes.length) {
      modalTripRoutes.innerHTML = '<p class="text-xs text-slate-500">Informasi rute belum tersedia.</p>';
      return;
    }
    modalTripRoutes.innerHTML = routes
      .map((route) => {
        const schedules = Array.isArray(route.schedules) ? route.schedules : [];
        const scheduleList = schedules.length
          ? schedules.map((schedule) => `<li class="text-xs rounded-xl border border-slate-100 bg-white px-3 py-2">${formatScheduleLabel(schedule)}</li>`).join('')
          : '<p class="text-xs text-slate-400">Jadwal akan diumumkan.</p>';
        const slotValue = Number.parseInt(route.slot_tersedia, 10);
        const slotInfo = Number.isNaN(slotValue) ? '—' : slotValue;
        const capacityValue = Number.parseInt(route.kapasitas, 10);
        return `
          <div class="rounded-2xl border border-slate-100 bg-white/90 p-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">${route.nama_rute || 'Rute MOSTYCOM'}</p>
                <p class="text-xs text-slate-500">${route.deskripsi_rute || 'Detail itinerary akan dibagikan oleh tim kami.'}</p>
              </div>
              <div class="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
                <span class="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-sky-50 text-sky-700 border border-sky-100">
                  Kapasitas ${Number.isNaN(capacityValue) ? '—' : capacityValue} pax
                </span>
                <span class="inline-flex items-center gap-1 rounded-full px-3 py-1 ${getSlotBadgeClass(slotValue)}">
                  Slot tersisa ${slotInfo}
                </span>
              </div>
            </div>
            <div class="mt-3 space-y-2">${scheduleList}</div>
          </div>
        `;
      })
      .join('');
  };

  const createPassengerInput = (index) => `
    <div class="rounded-2xl border border-slate-100 bg-white px-4 py-3 space-y-2" data-passenger-index="${index}">
      <p class="text-xs font-semibold text-slate-400">Traveler #${index + 1}</p>
      <input type="text" name="passenger-name-${index}" placeholder="Nama lengkap traveler" required
        class="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
      <input type="text" name="passenger-passport-${index}" placeholder="Nomor paspor / identitas" required
        class="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
    </div>
  `;

  const renderPassengerInputs = (count) => {
    if (!tripBookingPassengers) return;
    const total = Math.max(1, count);
    tripBookingPassengers.innerHTML = Array.from({ length: total }).map((_, index) => createPassengerInput(index)).join('');
  };

  const readPassengerDetails = () => {
    if (!tripBookingPassengers) return [];
    return Array.from(tripBookingPassengers.querySelectorAll('[data-passenger-index]')).map((block) => {
      const index = block.dataset.passengerIndex || '0';
      const nameInput = block.querySelector(`input[name="passenger-name-${index}"]`);
      const passportInput = block.querySelector(`input[name="passenger-passport-${index}"]`);
      return {
        name: nameInput ? (nameInput.value || '').trim() : '',
        passport: passportInput ? (passportInput.value || '').trim() : ''
      };
    }).filter((passenger) => passenger.name !== '');
  };

  const getActiveRouteByKey = (routeKey = activeRouteKey) => {
    if (!activeTrip || !Array.isArray(activeTrip.routes)) return null;
    return activeTrip.routes.find((route) => route.clientKey === routeKey) || null;
  };

  const getActiveScheduleByKey = (scheduleKey = activeScheduleKey, routeKey = activeRouteKey) => {
    const route = getActiveRouteByKey(routeKey);
    if (!route || !Array.isArray(route.schedules)) return null;
    return route.schedules.find((schedule) => schedule.clientKey === scheduleKey) || null;
  };

  const updateBookingSummary = () => {
    if (!tripBookingSummary) return;
    if (!activeTrip) {
      tripBookingSummary.textContent = '';
      return;
    }
    const route = getActiveRouteByKey();
    const schedule = getActiveScheduleByKey();
    const pax = tripBookingPaxInput?.value?.trim();
    const summaryParts = [
      route ? `Rute: ${route.nama_rute || 'Favorit'}` : null,
      schedule ? `Jadwal: ${formatScheduleLabel(schedule)}` : null,
      pax ? `Peserta: ${pax} orang` : null
    ].filter(Boolean);
    tripBookingSummary.textContent = summaryParts.length
      ? `Ringkasan: ${summaryParts.join(' · ')}`
      : 'Lengkapi formulir booking untuk lanjut.';
  };

  const renderBookingInvoice = (invoice) => {
    if (!bookingInvoiceOverlay) return;
    bookingInvoiceTripTitle.textContent = invoice.tripName || 'Trip MOSTYCOM';
    bookingInvoiceRouteLabel.textContent = invoice.routeName || 'Rute pilihan traveler';
    bookingInvoiceSchedule.textContent = invoice.scheduleLabel || 'Jadwal menyusul';
    bookingInvoicePax.textContent = invoice.paxLabel || '-';
    bookingInvoicePrice.textContent = invoice.priceLabel || 'Hubungi Kami';
    bookingInvoiceTotal.textContent = invoice.totalLabel || 'Hubungi Kami';
    if (bookingInvoiceNote) {
      bookingInvoiceNote.innerHTML = invoice.note
        ? invoice.note.replace(/\n/g, '<br>')
        : 'Tim kami akan menghubungi Anda untuk detail pembayaran.';
    }
  };

  const showBookingInvoice = (invoiceData) => {
    if (!bookingInvoiceOverlay) {
      window.open(invoiceData.whatsappUrl, '_blank', 'noopener');
      pendingBookingInfo = null;
      closeTripModal();
      return;
    }
    pendingBookingInfo = invoiceData;
    renderBookingInvoice(invoiceData.invoice);
    bookingInvoiceOverlay.classList.remove('hidden');
  };

  const hideBookingInvoice = () => {
    if (bookingInvoiceOverlay) {
      bookingInvoiceOverlay.classList.add('hidden');
    }
    pendingBookingInfo = null;
  };

  const updateScheduleOptions = (routeKey) => {
    if (!tripBookingScheduleSelect) return;
    const route = getActiveRouteByKey(routeKey);
    if (!route || !Array.isArray(route.schedules) || !route.schedules.length) {
      tripBookingScheduleSelect.innerHTML = '<option value="">Jadwal belum tersedia</option>';
      tripBookingScheduleSelect.setAttribute('disabled', 'true');
      activeScheduleKey = null;
      updateBookingSummary();
      return;
    }
    tripBookingScheduleSelect.removeAttribute('disabled');
    tripBookingScheduleSelect.innerHTML = route.schedules
      .map((schedule) => `<option value="${schedule.clientKey}">${formatScheduleLabel(schedule)}</option>`)
      .join('');
    activeScheduleKey = route.schedules.some((item) => item.clientKey === activeScheduleKey)
      ? activeScheduleKey
      : route.schedules[0].clientKey;
    tripBookingScheduleSelect.value = activeScheduleKey;
    const paxCount = Number.parseInt(tripBookingPaxInput?.value, 10);
    renderPassengerInputs(Number.isNaN(paxCount) ? 1 : paxCount);
    updateBookingSummary();
  };

  const populateRouteSelectOptions = (trip) => {
    if (!tripBookingRouteSelect) return;
    const routes = Array.isArray(trip?.routes) ? trip.routes : [];
    if (!routes.length) {
      tripBookingRouteSelect.innerHTML = '<option value="">Rute belum tersedia</option>';
      tripBookingRouteSelect.setAttribute('disabled', 'true');
      updateScheduleOptions(null);
      return;
    }
    tripBookingRouteSelect.removeAttribute('disabled');
    tripBookingRouteSelect.innerHTML = routes
      .map((route) => {
        const slotValue = Number.parseInt(route.slot_tersedia, 10);
        const slotInfo = Number.isNaN(slotValue) ? 'Slot terbatas' : `${slotValue} slot`;
        return `<option value="${route.clientKey}">${route.nama_rute || 'Rute MOSTYCOM'} · ${slotInfo}</option>`;
      })
      .join('');
    tripBookingRouteSelect.value = activeRouteKey || routes[0].clientKey;
    activeRouteKey = tripBookingRouteSelect.value || routes[0].clientKey;
    updateScheduleOptions(activeRouteKey);
  };

  const toggleBookingView = (mode = 'detail') => {
    const isBooking = mode === 'booking';
    tripDetailView?.classList.toggle('hidden', isBooking);
    tripBookingView?.classList.toggle('hidden', !isBooking);
  };

  const resetBookingFormState = () => {
    activeTrip = null;
    activeRouteKey = null;
    activeScheduleKey = null;
    tripBookingForm?.reset();
    if (tripBookingPassengers) {
      tripBookingPassengers.innerHTML = '';
    }
    if (tripBookingScheduleSelect) {
      tripBookingScheduleSelect.innerHTML = '<option value="">Pilih jadwal</option>';
      tripBookingScheduleSelect.setAttribute('disabled', 'true');
    }
    if (tripBookingRouteSelect) {
      tripBookingRouteSelect.innerHTML = '<option value="">Pilih rute</option>';
      tripBookingRouteSelect.setAttribute('disabled', 'true');
    }
    updateBookingSummary();
    toggleBookingView('detail');
  };

  const initializeBookingState = (trip) => {
    if (tripBookingForm) {
      tripBookingForm.reset();
    }
    activeRouteKey = Array.isArray(trip.routes) && trip.routes[0] ? trip.routes[0].clientKey : null;
    activeScheduleKey = Array.isArray(trip.routes) && trip.routes[0]?.schedules?.[0]
      ? trip.routes[0].schedules[0].clientKey
      : null;
    populateRouteSelectOptions(trip);
    if (tripBookingPaxInput) {
      const defaultValue = tripBookingPaxInput.getAttribute('value') || '2';
      tripBookingPaxInput.value = defaultValue;
      renderPassengerInputs(parseInt(defaultValue, 10));
    }
    updateBookingSummary();
  };

  const buildBookingMessage = ({ tripName, routeName, scheduleLabel, pax, name, phone, note, passengers = [] }) => {
    const lines = [
      'Halo MOSTYCOM, saya ingin booking trip berikut:',
      `Trip: ${tripName}`,
      `Rute: ${routeName}`,
      `Jadwal: ${scheduleLabel}`,
      `Jumlah Peserta: ${pax}`,
      `Nama: ${name}`,
      `Kontak: ${phone}`
    ];
    if (note) {
      lines.push(`Catatan: ${note}`);
    }
    if (passengers.length) {
      lines.push('Detail Peserta:');
      passengers.forEach((passenger, idx) => {
        const identity = passenger.passport ? ` - ${passenger.passport}` : '';
        lines.push(`  ${idx + 1}. ${passenger.name}${identity}`);
      });
    }
    return encodeURIComponent(lines.join('\n'));
  };

  const handleBookingSubmit = (event) => {
    event.preventDefault();
    if (!activeTrip) {
      alert('Pilih trip terlebih dahulu.');
      return;
    }
    const name = (tripBookingNameInput?.value || '').trim();
    const phone = (tripBookingPhoneInput?.value || '').trim();
    const paxValue = parseInt(tripBookingPaxInput?.value, 10);
    const pax = Number.isNaN(paxValue) || paxValue <= 0 ? 1 : paxValue;
    const note = (tripBookingNoteInput?.value || '').trim();
    const passengers = readPassengerDetails();

    if (!name || !phone) {
      alert('Nama dan nomor WhatsApp wajib diisi.');
      return;
    }

    if (!activeRouteKey) {
      alert('Silakan pilih rute terlebih dahulu.');
      return;
    }
    if (!activeScheduleKey) {
      alert('Silakan pilih jadwal keberangkatan.');
      return;
    }

    if (passengers.length !== pax) {
      alert('Lengkapi data setiap peserta sesuai jumlah yang dipilih.');
      return;
    }

    const route = getActiveRouteByKey();
    const schedule = getActiveScheduleByKey();
    const scheduleLabel = schedule ? formatScheduleLabel(schedule) : 'Jadwal menyusul';
    const pricePerPax = parsePriceToNumber(route?.harga);
    const totalPrice = pricePerPax * pax;
    const message = buildBookingMessage({
      tripName: activeTrip.nama_trip || 'Trip MOSTYCOM',
      routeName: route?.nama_rute || 'Rute pilihan',
      scheduleLabel,
      pax,
      name,
      phone,
      note,
      passengers
    });

    const bookingPhoneRaw = (state.contact && state.contact.no_wa) ? state.contact.no_wa : BOOKING_WHATSAPP_PHONE;
    const bookingPhone = normalizeWhatsappNumber(bookingPhoneRaw) || BOOKING_WHATSAPP_PHONE;
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${bookingPhone}&text=${message}&type=phone_number&app_absent=0`;
    showBookingInvoice({
      whatsappUrl,
      invoice: {
        tripName: activeTrip.nama_trip || 'Trip MOSTYCOM',
        routeName: route?.nama_rute || 'Rute pilihan traveler',
        scheduleLabel,
        paxLabel: `${pax} orang`,
        priceLabel: pricePerPax ? formatCurrency(pricePerPax) : 'Hubungi Kami',
        totalLabel: pricePerPax ? formatCurrency(totalPrice) : 'Hubungi Kami',
        note: passengers.length
          ? [
            'Detail Peserta:',
            ...passengers.map((passenger, idx) => `${idx + 1}. ${passenger.name}${passenger.passport ? ` - ${passenger.passport}` : ''}`),
            note ? `Catatan tambahan: ${note}` : null
          ].filter(Boolean).join('\n')
          : (note ? `Catatan tambahan: ${note}` : '')
      }
    });
  };

  const renderContact = () => {
    if (!state.contact) return;
    const {
      title,
      description,
      hours,
      email,
      phone,
      whatsapp,
      address,
      lat,
      lng,
      vision,
      mission,
      trust_score: trustScore,
      review,
      header_image_url: headerImageUrl,
      trust_image_url: trustImageUrl,
      about: aboutText
    } = state.contact;
    if (aboutTitleNode && (state.contact.judul_about || aboutTitleNode.textContent)) {
      aboutTitleNode.textContent = state.contact.judul_about || aboutTitleNode.textContent;
    }
    if (aboutDescriptionNode && state.contact.deskripsi_about) {
      aboutDescriptionNode.textContent = state.contact.deskripsi_about;
    }
    if (aboutAddressNode && state.contact.alamat_lengkap) {
      aboutAddressNode.textContent = state.contact.alamat_lengkap;
    }
    if (aboutEmailNode && state.contact.email) {
      aboutEmailNode.textContent = state.contact.email;
    }
    if (aboutPhoneNode && state.contact.telepon) {
      aboutPhoneNode.textContent = state.contact.telepon;
    }
    if (aboutWhatsappNode && state.contact.no_wa) {
      aboutWhatsappNode.textContent = state.contact.no_wa;
    }
    // if (contactTitle) contactTitle.textContent = title || contactTitle.textContent;
    if (contactTitle) contactTitle.textContent = state.contact.judul_section || contactTitle.textContent;

    // if (contactDescription) contactDescription.textContent = description || contactDescription.textContent;
    if (contactDescription) contactDescription.textContent = state.contact.deskripsi_singkat

    // if (contactHours) contactHours.innerHTML = (hours || contactHours.innerHTML).replace(/\n/g, '<br>');
    if (contactHours) {
      const jamOperasional = state.contact.jam_operasional || '';
      contactHours.innerHTML = jamOperasional.replace(/\n/g, '<br>');
    }

    if (contactEmail) contactEmail.textContent = email || contactEmail.textContent;
    // if (contactPhone) contactPhone.textContent = phone || contactPhone.textContent;
    if (contactPhone) contactPhone.textContent = state.contact.telepon

    // if (contactWhatsapp) contactWhatsapp.textContent = whatsapp || contactWhatsapp.textContent;
    if (contactWhatsapp) contactWhatsapp.textContent = state.contact.no_wa

    updateWhatsappFloatingLink(state.contact.no_wa);
    if (contactAddress && address) contactAddress.textContent = address;
    if (heroBackgroundImage && (headerImageUrl || CONTACT_HEADER_PLACEHOLDER)) {
      heroBackgroundImage.src = headerImageUrl || CONTACT_HEADER_PLACEHOLDER;
    }
    // if (visionText && state.contact.visi) {
    //   visionText.textContent = state.contact.visi;
    // }
    renderVissionItems(state.contact.visi)
    renderMissionItems(state.contact.misi);
    if (trustScoreValue && state.contact.trush_score) {
      trustScoreValue.textContent = state.contact.trush_score;
    }
    if (trustReviewText && state.contact.ulasan) {
      trustReviewText.textContent = state.contact.ulasan;
    }
    if (trustImageNode) {
      trustImageNode.src = trustImageUrl || CONTACT_TRUST_PLACEHOLDER;
    }
    updateContactMap(state.contact.latitude, state.contact.longitude, title || 'MOSTYCOM HQ');
  };

  const updateContactMap = (lat, lng, title) => {
    if (!contactMapElement || !window.L) return;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const isValid = !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng);
    const fallback = [-6.2442, 106.8023];
    const coordinates = isValid ? [parsedLat, parsedLng] : fallback;
    if (!contactMap) {
      contactMap = L.map('contact-map', {
        zoomControl: false,
        scrollWheelZoom: false
      }).setView(coordinates, 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(contactMap);
      L.control.zoom({ position: 'bottomright' }).addTo(contactMap);
      contactMarker = L.marker(coordinates).addTo(contactMap);
    } else {
      contactMap.setView(coordinates);
      if (contactMarker) {
        contactMarker.setLatLng(coordinates);
      } else {
        contactMarker = L.marker(coordinates).addTo(contactMap);
      }
    }
    if (contactMarker) {
      contactMarker.bindPopup(`<strong>${title}</strong>`).openPopup();
    }
  };

  const renderFaqs = () => {
    if (!faqListContainer) return;
    if (!state.faqs.length) {
      faqListContainer.innerHTML = '';
      faqEmptyState?.classList.remove('hidden');
      return;
    }
    faqEmptyState?.classList.add('hidden');
    faqListContainer.innerHTML = state.faqs
      .map((faq, index) => `
        <div class="faq-item border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden transition">
          <button class="faq-question flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold text-slate-900"
            aria-expanded="false">
            <span>${faq.judul || `FAQ ${index + 1}`}</span>
            <span
              class="faq-icon inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-400 transition-transform duration-200">+</span>
          </button>
          <div class="faq-answer hidden px-6 pb-6 text-sm leading-relaxed text-slate-600 border-t border-slate-100 bg-slate-50">
            ${faq.isi || ''}
          </div>
        </div>
      `)
      .join('');
    initFAQ();
  };

  const attachTripCardEvents = () => {
    document.querySelectorAll('[data-trip-id]').forEach((btn) => {
      btn.addEventListener('click', () => openTripModal(btn.dataset.tripId));
    });
  };

  const attachArticleCardEvents = () => {
    document.querySelectorAll('[data-article-id]').forEach((btn) => {
      btn.addEventListener('click', () => openArticleModal(btn.dataset.articleId));
    });
  };

  const openTripModal = (tripId) => {
    const trip = state.trips.find((item) => String(item.id) === String(tripId));
    if (!trip) return;
    activeTrip = normalizeTripRecord(trip);
    const scheduleText = formatTripSchedule(activeTrip.jadwal);
    modalTripImage.src = activeTrip.gambar_url || TRIP_PLACEHOLDER;
    modalTripImage.alt = activeTrip.nama_trip || 'Trip MOSTYCOM';
    modalTripTitle.textContent = activeTrip.nama_trip || 'Trip MOSTYCOM';
    modalTripLocation.textContent = activeTrip.destinasi || 'Destinasi akan diumumkan';
    modalTripPrice.textContent = `Status: ${(activeTrip.status || 'draft').toUpperCase()}`;
    modalTripDuration.textContent = scheduleText;
    modalTripDesc.textContent = DEFAULT_TRIP_DESC;
    const highlights = [
      `Destinasi: ${activeTrip.destinasi || 'Segera diumumkan'}`,
      `Jadwal keberangkatan: ${scheduleText}`,
      'Kontak tim MOSTYCOM untuk paket lengkap.'
    ];
    modalTripHighlights.innerHTML = highlights.map((item) => `<li>${item}</li>`).join('');
    renderRichText(modalTripTerms, activeTrip.terms, 'Hubungi tim kami untuk detail syarat & ketentuan.');
    renderRichText(modalTripVisa, activeTrip.term_visa, 'Informasi proses visa akan dibagikan setelah konsultasi.');
    renderRichText(modalTripNotes, activeTrip.catatan_trip, 'Catatan tambahan akan diinformasikan oleh travel specialist kami.');
    renderTripRoutesList(activeTrip);
    initializeBookingState(activeTrip);
    toggleBookingView('detail');
    tripModal.classList.remove('hidden');
    lockBodyScroll();
  };

  const closeTripModal = () => {
    tripModal.classList.add('hidden');
    hideBookingInvoice();
    resetBookingFormState();
    releaseBodyScroll();
  };

  const openArticleModal = (articleId) => {
    const article = state.articles.find((item) => String(item.id) === String(articleId));
    if (!article) return;
    const dateLabel = formatDate(article.created_at, { day: 'numeric', month: 'long', year: 'numeric' });
    articleModalImage.src = article.gambar_url || ARTICLE_PLACEHOLDER;
    articleModalTitle.textContent = article.judul || 'Artikel MOSTYCOM';
    articleModalDate.textContent = dateLabel || (article.kategori || '').toUpperCase();
    articleModalDesc.textContent = article.kategori || 'MOSTYCOM';
    const paragraphs = (article.isi || '').split(/\n+/).filter((item) => item.trim() !== '');
    articleModalBody.innerHTML = paragraphs.length
      ? paragraphs.map((item) => `<p>${item}</p>`).join('')
      : '<p>Konten lengkap akan segera hadir.</p>';
    articleModal.classList.remove('hidden');
    lockBodyScroll();
  };

  const closeArticleModal = () => {
    articleModal.classList.add('hidden');
    releaseBodyScroll();
  };

  const applyTripFilter = (targetFilter, updateState = true) => {
    if (updateState) {
      state.regionFilter = targetFilter;
    }
    document.querySelectorAll('.filter-btn').forEach((button) => {
      const isActive = button.dataset.filter === state.regionFilter;
      button.classList.toggle('bg-sky-500', isActive);
      button.classList.toggle('text-white', isActive);
      button.classList.toggle('bg-white', !isActive);
      button.classList.toggle('text-slate-500', !isActive);
    });
    document.querySelectorAll('[data-region]').forEach((card) => {
      const cardRegion = card.dataset.region || 'all';
      if (state.regionFilter === 'all' || state.regionFilter === cardRegion) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  const initFilterButtons = () => {
    document.querySelectorAll('.filter-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.dataset.filter || 'all';
        applyTripFilter(target);
      });
    });
  };

  const initTripModalListeners = () => {
    tripModalClose?.addEventListener('click', closeTripModal);
    tripModal?.addEventListener('click', (event) => {
      if (event.target === tripModal) closeTripModal();
    });
    modalCTA?.addEventListener('click', () => {
      toggleBookingView('booking');
    });
    tripBookingBackBtn?.addEventListener('click', () => toggleBookingView('detail'));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !tripModal.classList.contains('hidden')) {
        closeTripModal();
      }
    });
    tripBookingForm?.addEventListener('submit', handleBookingSubmit);
  };

  const initBookingInvoiceListeners = () => {
    bookingInvoiceConfirm?.addEventListener('click', () => {
      if (!pendingBookingInfo || !pendingBookingInfo.whatsappUrl) {
        hideBookingInvoice();
        return;
      }
      window.open(pendingBookingInfo.whatsappUrl, '_blank', 'noopener');
      hideBookingInvoice();
      closeTripModal();
    });
    const handleInvoiceCancel = () => {
      hideBookingInvoice();
    };
    bookingInvoiceCancel?.addEventListener('click', handleInvoiceCancel);
    bookingInvoiceClose?.addEventListener('click', handleInvoiceCancel);
    bookingInvoiceOverlay?.addEventListener('click', (event) => {
      if (event.target === bookingInvoiceOverlay) {
        handleInvoiceCancel();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && bookingInvoiceOverlay && !bookingInvoiceOverlay.classList.contains('hidden')) {
        handleInvoiceCancel();
      }
    });
  };

  const initArticleModalListeners = () => {
    articleModalClose?.addEventListener('click', closeArticleModal);
    articleModal?.addEventListener('click', (event) => {
      if (event.target === articleModal) closeArticleModal();
    });
    articleModalCTA?.addEventListener('click', closeArticleModal);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !articleModal.classList.contains('hidden')) {
        closeArticleModal();
      }
    });
  };

  const initMobileMenu = () => {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  };

  const initFAQ = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const button = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');
      if (!button || !answer) return;
      button.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq-open');
        faqItems.forEach((otherItem) => {
          if (otherItem === item) return;
          otherItem.classList.remove('faq-open');
          otherItem.querySelector('.faq-answer')?.classList.add('hidden');
          otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-icon')?.classList.remove('rotate-45');
        });
        item.classList.toggle('faq-open', !isOpen);
        answer.classList.toggle('hidden', isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
        icon?.classList.toggle('rotate-45', !isOpen);
      });
    });
  };

  const initTracking = () => {
    const trackingForm = document.getElementById('tracking-form');
    const trackingDetail = document.getElementById('tracking-detail');
    const trackingResult = document.getElementById('tracking-result');
    const statusColorMap = {
      pending: 'bg-slate-400',
      booked: 'bg-amber-400',
      confirmed: 'bg-sky-500',
      ongoing: 'bg-indigo-500',
      completed: 'bg-emerald-500',
      cancelled: 'bg-red-500'
    };
    const progressMap = {
      pending: 15,
      booked: 30,
      confirmed: 55,
      ongoing: 75,
      completed: 100,
      cancelled: 5
    };

    const formatStatus = (value) => {
      if (!value) return 'Pending';
      return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const renderTracking = (code, info, message = null) => {
      if (!trackingDetail || !trackingResult) return;
      if (message) {
        trackingDetail.innerHTML = `
          <div class="space-y-3 text-center py-6">
            <p class="text-sm text-slate-400">Kode Booking</p>
            <h3 class="text-2xl font-semibold text-slate-900">${code || '—'}</h3>
            <p class="text-sm font-semibold text-red-500">${message}</p>
            <p class="text-xs text-slate-400">Pastikan kode booking sesuai format yang dikirim pada invoice.</p>
          </div>
        `;
      } else {
        const statusValue = (info.status || 'pending').toLowerCase();
        const statusColor = statusColorMap[statusValue] || 'bg-slate-400';
        const progress = progressMap[statusValue] ?? 30;
        const updatedLabel = info.updated_at ? formatDate(info.updated_at, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Menunggu update';
        trackingDetail.innerHTML = `
          <div class="space-y-2">
            <p class="text-sm text-slate-400">Kode Booking</p>
            <h3 class="text-2xl font-semibold text-slate-900">${code}</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p class="text-slate-400">Nama Customer</p>
              <p class="font-semibold text-slate-900">${info.nama || 'Traveler MOSTYCOM'}</p>
            </div>
            <div>
              <p class="text-slate-400">Status</p>
              <span class="inline-flex items-center text-white text-xs font-semibold px-3 py-1 rounded-full ${statusColor}">${formatStatus(info.status)}</span>
            </div>
            <div>
              <p class="text-slate-400">Kode Booking</p>
              <p class="font-semibold text-slate-900">${info.kode_booking || code}</p>
            </div>
            <div>
              <p class="text-slate-400">Update Terakhir</p>
              <p class="font-semibold text-slate-900">${updatedLabel}</p>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-sm text-slate-400">Progress</p>
            <div class="w-full bg-slate-100 rounded-full h-3 mt-1">
              <div class="bg-sky-500 h-3 rounded-full" style="width: ${progress}%"></div>
            </div>
          </div>
        `;
      }
      trackingDetail.classList.remove('hidden');
      trackingResult.classList.add('ring-2', 'ring-sky-100');
    };

    trackingForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const codeInput = document.getElementById('booking-code');
      const bookingCode = (codeInput?.value || '').trim().toUpperCase();
      trackingDetail.innerHTML = '';
      if (!bookingCode) {
        renderTracking('—', { status: 'pending' }, 'Masukkan kode booking untuk melacak status perjalanan Anda.');
        return;
      }
      try {
        const response = await fetch(`${PUBLIC_TRACKING_API_ENDPOINT}?kode_booking=${encodeURIComponent(bookingCode)}`, {
          cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          renderTracking(bookingCode || '—', { status: 'pending', kode_booking: bookingCode }, data.message || 'Kode booking tidak ditemukan.');
          return;
        }
        renderTracking(bookingCode, data.data || {}, null);
      } catch (error) {
        console.warn('Gagal melacak booking:', error);
        renderTracking(bookingCode, { status: 'pending', kode_booking: bookingCode }, 'Gagal memuat status. Coba beberapa saat lagi.');
      }
    });
  };

  const initTestimonials = () => {
    const track = document.getElementById('testimonial-track');
    const dotsContainer = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    const emptyState = testimonialEmptyState;
    let slides = [];
    let index = 0;
    let intervalId = null;

    const updateDots = () => {
      if (!dotsContainer) return;
      dotsContainer.querySelectorAll('button').forEach((dot, idx) => {
        dot.classList.toggle('bg-sky-500', idx === index);
        dot.classList.toggle('border-sky-500', idx === index);
      });
    };

    const goToSlide = (target) => {
      if (!track || !slides.length) return;
      index = target;
      track.style.transform = `translateX(-${index * 100}%)`;
      updateDots();
    };

    const restartInterval = () => {
      if (intervalId) window.clearInterval(intervalId);
      if (slides.length <= 1) return;
      intervalId = window.setInterval(() => {
        index = (index + 1) % slides.length;
        goToSlide(index);
      }, 6000);
    };

    const renderDots = () => {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = slides.length
        ? Array.from({ length: slides.length })
          .map((_, idx) => `<button data-index="${idx}" class="w-3 h-3 rounded-full border border-slate-300 transition"></button>`)
          .join('')
        : '';
      dotsContainer.querySelectorAll('button').forEach((dot) => {
        dot.addEventListener('click', () => {
          index = Number(dot.dataset.index) || 0;
          goToSlide(index);
          restartInterval();
        });
      });
    };

    const createSlideMarkup = (item) => {
      const starCount = Math.max(1, Math.min(5, parseInt(item.rate, 10) || 0));
      const stars = '★'.repeat(starCount).padEnd(5, '☆');
      const imageSrc = item.image_url || TESTIMONIAL_IMAGE_PLACEHOLDER;
      return `
        <article class="testimonial-slide w-full shrink-0 px-6 py-10 md:px-12 md:py-16">
          <div class="mx-auto max-w-3xl flex flex-col lg:flex-row items-center gap-8 text-left lg:text-left">
            <img src="${imageSrc}" alt="${item.nama || 'Traveler MOSTYCOM'}"
              class="testimonial-avatar w-28 h-28 rounded-3xl object-cover shadow-lg" />
            <div class="text-center lg:text-left">
              <h3 class="text-2xl font-semibold text-slate-900">${item.nama || 'Traveler MOSTYCOM'}</h3>
              <p class="text-sky-500 mt-1 text-xl tracking-widest">${stars}</p>
              <p class="text-lg text-slate-500 mt-4">"${item.isi || 'MOSTYCOM selalu siap mendampingi perjalanan Anda.'}"</p>
            </div>
          </div>
        </article>
      `;
    };

    const render = (items) => {
      if (!track) return;
      if (!items.length) {
        track.innerHTML = '';
        dotsContainer && (dotsContainer.innerHTML = '');
        emptyState?.classList.remove('hidden');
        prevBtn?.setAttribute('disabled', 'true');
        nextBtn?.setAttribute('disabled', 'true');
        if (intervalId) window.clearInterval(intervalId);
        return;
      }
      emptyState?.classList.add('hidden');
      prevBtn?.removeAttribute('disabled');
      nextBtn?.removeAttribute('disabled');
      track.innerHTML = items.map((item) => createSlideMarkup(item)).join('');
      slides = track.querySelectorAll('.testimonial-slide');
      index = 0;
      renderDots();
      goToSlide(0);
      restartInterval();
    };

    prevBtn?.addEventListener('click', () => {
      if (!slides.length) return;
      index = index === 0 ? slides.length - 1 : index - 1;
      goToSlide(index);
      restartInterval();
    });

    nextBtn?.addEventListener('click', () => {
      if (!slides.length) return;
      index = (index + 1) % slides.length;
      goToSlide(index);
      restartInterval();
    });

    return { render };
  };

  const loadTrips = async () => {
    try {
      const result = await fetchWithFallback(PUBLIC_TRIP_API_ENDPOINTS);
      state.trips = Array.isArray(result.data) ? result.data.map((trip, index) => normalizeTripRecord(trip, index)) : [];
      renderTrips();
    } catch (error) {
      console.warn('Gagal memuat trip publik:', error);
      tripEmptyState?.classList.remove('hidden');
    }
  };

  const loadArticles = async () => {
    try {
      const result = await fetchWithFallback(PUBLIC_ARTICLE_API_ENDPOINTS);
      state.articles = Array.isArray(result.data) ? result.data : [];
      renderArticles();
    } catch (error) {
      console.warn('Gagal memuat artikel publik:', error);
      articleEmptyState?.classList.remove('hidden');
    }
  };

  const loadContact = async () => {
    try {
      const result = await fetchWithFallback(PUBLIC_CONTACT_API_ENDPOINTS);
      state.contact = result.data || null;
      renderContact();
    } catch (error) {
      console.warn('Gagal memuat informasi kontak:', error);
    }
  };

  const loadTestimonials = async () => {
    try {
      const result = await fetchWithFallback(PUBLIC_TESTIMONIAL_API_ENDPOINTS);
      state.testimonials = Array.isArray(result.data) ? result.data : [];
      testimonialSliderController?.render?.(state.testimonials);
    } catch (error) {
      console.warn('Gagal memuat testimoni:', error);
      testimonialSliderController?.render?.([]);
    }
  };

  const loadFaqs = async () => {
    try {
      const result = await fetchWithFallback(PUBLIC_FAQ_API_ENDPOINTS);
      state.faqs = Array.isArray(result.data) ? result.data : [];
      renderFaqs();
    } catch (error) {
      console.warn('Gagal memuat FAQ:', error);
      faqEmptyState?.classList.remove('hidden');
    }
  };

  applyStaticClasses();
  initFilterButtons();
  applyTripFilter('all');
  initTripModalListeners();
  initBookingInvoiceListeners();
  tripBookingRouteSelect?.addEventListener('change', (event) => {
    activeRouteKey = event.target.value || null;
    activeScheduleKey = null;
    updateScheduleOptions(activeRouteKey);
  });
  tripBookingScheduleSelect?.addEventListener('change', (event) => {
    activeScheduleKey = event.target.value || null;
    updateBookingSummary();
  });
  tripBookingPaxInput?.addEventListener('input', () => {
    const value = Number.parseInt(tripBookingPaxInput.value, 10);
    renderPassengerInputs(Number.isNaN(value) ? 1 : value);
    updateBookingSummary();
  });
  initArticleModalListeners();
  initMobileMenu();
  initFAQ();
  initTracking();
  testimonialSliderController = initTestimonials();
  loadTrips();
  loadArticles();
  loadContact();
  loadTestimonials();
  loadFaqs();
});
