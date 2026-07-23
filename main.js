document.addEventListener('DOMContentLoaded', () => {

  // 1. حماية كليّة للصور لمنع الزر الأيمن والسحب
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', (e) => e.preventDefault());
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // عناصر أزرار التنقل التدريجي
  const scrollStepUpBtn = document.getElementById('scrollStepUpBtn');
  const scrollStepDownBtn = document.getElementById('scrollStepDownBtn');

  // عناصر قائمة الموبايل
  const menuBtn = document.getElementById('menuBtn');
  const menuIcon = document.getElementById('menuIcon');
  const closeIcon = document.getElementById('closeIcon');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileContent = document.getElementById('mobileContent');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');

  // إظهار/إخفاء أزرار السكرول التدريجي
  window.addEventListener('scroll', () => {
    if (scrollStepUpBtn) {
      if (window.scrollY > 200) {
        scrollStepUpBtn.classList.remove('opacity-0', 'pointer-events-none');
        scrollStepUpBtn.classList.add('opacity-100', 'pointer-events-auto');
      } else {
        scrollStepUpBtn.classList.add('opacity-0', 'pointer-events-none');
        scrollStepUpBtn.classList.remove('opacity-100', 'pointer-events-auto');
      }
    }
  });

  if (scrollStepUpBtn) {
    scrollStepUpBtn.addEventListener('click', () => scrollStep(-400));
  }

  if (scrollStepDownBtn) {
    scrollStepDownBtn.addEventListener('click', () => scrollStep(400));
  }

  function scrollStep(amount) {
    window.scrollBy({ top: amount, behavior: 'smooth' });
  }

  // قائمة الموبايل
  let isMenuOpen = false;
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
      mobileOverlay?.classList.remove('opacity-0', 'pointer-events-none');
      mobileOverlay?.classList.add('opacity-100', 'pointer-events-auto');
      mobileContent?.classList.remove('-translate-y-8');
      mobileContent?.classList.add('translate-y-0');

      menuIcon?.classList.add('rotate-90', 'scale-0', 'opacity-0');
      closeIcon?.classList.remove('-rotate-90', 'scale-0', 'opacity-0');
      closeIcon?.classList.add('rotate-0', 'scale-100', 'opacity-100');
    } else {
      mobileOverlay?.classList.add('opacity-0', 'pointer-events-none');
      mobileOverlay?.classList.remove('opacity-100', 'pointer-events-auto');
      mobileContent?.classList.add('-translate-y-8');
      mobileContent?.classList.remove('translate-y-0');

      menuIcon?.classList.remove('rotate-90', 'scale-0', 'opacity-0');
      closeIcon?.classList.add('-rotate-90', 'scale-0', 'opacity-0');
      closeIcon?.classList.remove('rotate-0', 'scale-100', 'opacity-100');
    }
  }

  menuBtn?.addEventListener('click', toggleMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) toggleMenu();
    });
  });

  // 2. عداد الزوار الحقيقي
  async function updateRealVisitorCount() {
    const headerCounter = document.getElementById('visitorCountHeader');
    let localVisits = parseInt(localStorage.getItem('ot_zone_visits_fallback') || '1');

    try {
      const response = await fetch('https://api.counterapi.dev/v1/ot-zone-palestine-2026/visits/up');
      const data = await response.json();
      if (data && typeof data.count !== 'undefined') {
        if (headerCounter) headerCounter.textContent = data.count.toLocaleString('en-US');
        return;
      }
    } catch (e) {
      // وضع احتياطي للأجهزة المحلية
    }

    localVisits += 1;
    localStorage.setItem('ot_zone_visits_fallback', localVisits);
    if (headerCounter) headerCounter.textContent = localVisits.toLocaleString('en-US');
  }

  updateRealVisitorCount();
  fetchRealLikesCount();
  renderReviews();
});

// ================= 3. نظام التقييمات والإعجابات =================
let formSelectedRating = 5;
let isLiked = localStorage.getItem('ot_zone_user_liked') === 'true';

const initialReviews = [];

function setFormRating(rating) {
  formSelectedRating = rating;
  const stars = document.querySelectorAll('#starContainer .star-btn');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.remove('text-slate-600');
      star.classList.add('text-cyan-400');
    } else {
      star.classList.remove('text-cyan-400');
      star.classList.add('text-slate-600');
    }
  });
}

function handleReviewSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('reviewerName').value.trim();
  const commentInput = document.getElementById('reviewerComment').value.trim();

  if (!nameInput || !commentInput) return;

  const newReview = {
    name: nameInput,
    rating: formSelectedRating,
    comment: commentInput,
    date: new Date().toISOString().split('T')[0]
  };

  let storedReviews = JSON.parse(localStorage.getItem('ot_zone_real_reviews') || '[]');
  storedReviews.unshift(newReview);
  localStorage.setItem('ot_zone_real_reviews', JSON.stringify(storedReviews));

  document.getElementById('reviewerName').value = '';
  document.getElementById('reviewerComment').value = '';
  setFormRating(5);
  renderReviews();

  alert('تم نشر تقييمك ورأيك بنجاح في بند التعليقات! شكرًا لمشاركتك. ⭐');
}

function renderReviews() {
  const reviewsContainer = document.getElementById('reviewsList');
  const countEl = document.getElementById('reviewsTotalCount');
  if (!reviewsContainer) return;

  let storedReviews = JSON.parse(localStorage.getItem('ot_zone_real_reviews') || '[]');
  let allReviews = [...storedReviews, ...initialReviews];

  if (countEl) countEl.textContent = `${allReviews.length} تعليقات`;

  if (allReviews.length === 0) {
    reviewsContainer.innerHTML = `
      <div class="p-6 text-center text-slate-500 border border-slate-800 rounded-2xl bg-slate-900/40 font-medium text-sm">
        لا توجد تعليقات منشورة حتى الآن. كن أول من يشارك برأيه! ✨
      </div>
    `;
    return;
  }

  reviewsContainer.innerHTML = allReviews.map(review => {
    const starsHtml = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    return `
      <div class="liquid-glass rounded-2xl p-5 border border-slate-800 bg-slate-900 shadow-sm hover:shadow-md transition-all">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="h-9 w-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">👤</div>
            <div>
              <h4 class="font-bold text-white text-sm sm:text-base">${escapeHtml(review.name)}</h4>
              <span class="text-xs text-slate-500 font-mono">${review.date}</span>
            </div>
          </div>
          <div class="text-cyan-400 font-bold text-base tracking-widest">${starsHtml}</div>
        </div>
        <p class="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mt-2">${escapeHtml(review.comment)}</p>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

// 4. جلب وعرض عدد الإعجابات الحقيقي
async function fetchRealLikesCount() {
  const countEl = document.getElementById('likeCount');
  let currentLikes = parseInt(localStorage.getItem('ot_zone_likes_fallback') || '0');

  try {
    const response = await fetch('https://api.counterapi.dev/v1/ot-zone-palestine-2026/likes');
    const data = await response.json();
    if (data && typeof data.count !== 'undefined') {
      if (countEl) countEl.textContent = data.count.toLocaleString('en-US');
      updateLikeUI();
      return;
    }
  } catch (e) {
    //
  }

  if (countEl) countEl.textContent = currentLikes.toLocaleString('en-US');
  updateLikeUI();
}

async function toggleLike(e) {
  if (e) e.preventDefault(); // منع إعادة تحميل الصفحة فوراً عند الضغط

  const heartEl = document.getElementById('likeHeart');
  const countEl = document.getElementById('likeCount');

  if (isLiked) {
    alert('لقد قمت بالإعجاب بالموقع سابقاً، شكراً لتعاطفك وتشجيعك! ❤️');
    return;
  }

  isLiked = true;
  localStorage.setItem('ot_zone_user_liked', 'true');

  let currentLikes = parseInt(localStorage.getItem('ot_zone_likes_fallback') || '0') + 1;
  localStorage.setItem('ot_zone_likes_fallback', currentLikes);

  if (countEl) countEl.textContent = currentLikes.toLocaleString('en-US');

  if (heartEl) {
    heartEl.classList.add('scale-125');
    setTimeout(() => heartEl.classList.remove('scale-125'), 200);
  }

  updateLikeUI();

  try {
    const response = await fetch('https://api.counterapi.dev/v1/ot-zone-palestine-2026/likes/up');
    const data = await response.json();
    if (data && typeof data.count !== 'undefined') {
      if (countEl) countEl.textContent = data.count.toLocaleString('en-US');
    }
  } catch (error) {
    //
  }
}

function updateLikeUI() {
  const heartEl = document.getElementById('likeHeart');
  const btnEl = document.getElementById('likeBtn');
  
  if (heartEl) heartEl.textContent = isLiked ? '❤️' : '🤍';
  
  if (btnEl) {
    if (isLiked) {
      btnEl.classList.add('bg-rose-950/80', 'border-rose-800', 'text-rose-200');
      btnEl.classList.remove('bg-slate-950', 'border-slate-800');
    } else {
      btnEl.classList.remove('bg-rose-950/80', 'border-rose-800', 'text-rose-200');
      btnEl.classList.add('bg-slate-950', 'border-slate-800');
    }
  }
}
