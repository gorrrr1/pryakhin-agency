/**
 * ИП ПРЯХИН МАТВЕЙ ВИКТОРОВИЧ — РЕКЛАМНОЕ АГЕНТСТВО (ОКВЭД 73.11)
 * Клиентский сценарий интерактивности:
 * - Интерактивный калькулятор медиасплита и юнит-экономики
 * - Табы направлений услуг (ОКВЭД 73.11)
 * - FAQ аккордеон
 * - Копирование юридических реквизитов контрагента в один клик
 * - Мобильное меню и обработка формы заявки
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTabs();
  initCalculator();
  initFaqAccordion();
  initCopyRequisites();
  initLeadForm();
  initSmoothScroll();
});

/* ==========================================================================
   1. МОБИЛЬНОЕ МЕНЮ
   ========================================================================== */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isExpanded = navMenu.classList.contains('open');
    menuToggle.setAttribute('aria-expanded', isExpanded);
  });

  // Закрывать при клике на пункт меню
  navMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   2. ТАБЫ НАПРАВЛЕНИЙ (ОКВЭД 73.11)
   ========================================================================== */
function initTabs() {
  const tabButtons = document.querySelectorAll('.services-tabs .tab-btn');
  const panes = document.querySelectorAll('.services-tabs .tab-pane');

  if (!tabButtons.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = `pane-${btn.dataset.tab}`;

      // Снять активность
      tabButtons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      // Активировать выбранный
      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. ИНТЕРАКТИВНЫЙ B2B-КАЛЬКУЛЯТОР МЕДИАПЛАНА
   ========================================================================== */
function initCalculator() {
  const budgetRange = document.getElementById('budgetRange');
  const budgetDisplay = document.getElementById('budgetDisplay');
  const industrySelect = document.getElementById('industrySelect');
  const goalRadios = document.querySelectorAll('input[name="calcGoal"]');

  // Результаты
  const reachVal = document.getElementById('reachVal');
  const leadsVal = document.getElementById('leadsVal');
  const cplVal = document.getElementById('cplVal');
  const feeVal = document.getElementById('feeVal');

  // Бары сплита
  const barContext = document.getElementById('barContext');
  const barTg = document.getElementById('barTg');
  const barRemarketing = document.getElementById('barRemarketing');
  const pctContext = document.getElementById('pctContext');
  const pctTg = document.getElementById('pctTg');
  const pctRemarketing = document.getElementById('pctRemarketing');

  const btnRequestPlan = document.getElementById('btnRequestPlan');

  if (!budgetRange) return;

  // Отраслевые коэффициенты CPL и охвата в B2B
  const industryConfigs = {
    production: { avgCpl: 8500, reachMultiplier: 55, name: 'Производство оборудования' },
    wholesale: { avgCpl: 6200, reachMultiplier: 70, name: 'Оптовые поставки' },
    construction: { avgCpl: 9800, reachMultiplier: 45, name: 'Строительство и девелопмент' },
    b2bservices: { avgCpl: 5400, reachMultiplier: 80, name: 'B2B консалтинг и услуги' },
    it_tech: { avgCpl: 11200, reachMultiplier: 38, name: 'Корпоративный IT-софт' }
  };

  function formatMoney(num) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num)) + ' ₽';
  }

  function formatNum(num) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
  }

  function updateCalculator() {
    const budget = parseInt(budgetRange.value, 10);
    budgetDisplay.textContent = formatMoney(budget);

    const indKey = industrySelect.value;
    const indData = industryConfigs[indKey] || industryConfigs.production;

    let selectedGoal = 'leads';
    goalRadios.forEach(r => {
      if (r.checked) selectedGoal = r.value;
    });

    // Настройки сплита в зависимости от цели
    let split = { context: 55, tg: 25, remarketing: 20 };
    if (selectedGoal === 'scale') {
      split = { context: 40, tg: 40, remarketing: 20 };
    } else if (selectedGoal === 'brand') {
      split = { context: 25, tg: 50, remarketing: 25 };
    }

    // Расчет охвата целевых ЛПР
    const estimatedReachMin = (budget / 1000) * indData.reachMultiplier * 0.85;
    const estimatedReachMax = (budget / 1000) * indData.reachMultiplier * 1.25;

    // Расчет лидов (SQL)
    const baseCpl = indData.avgCpl;
    const minLeads = Math.max(4, Math.round((budget * 0.82) / (baseCpl * 1.25)));
    const maxLeads = Math.max(6, Math.round((budget * 0.82) / (baseCpl * 0.85)));

    const cplMin = Math.round(baseCpl * 0.85);
    const cplMax = Math.round(baseCpl * 1.25);

    // Агентское вознаграждение (SLA & сопровождение)
    let fee = 55000;
    if (budget > 1000000) {
      fee = Math.round(budget * 0.08);
    } else if (budget > 500000) {
      fee = 85000;
    } else if (budget > 300000) {
      fee = 65000;
    }

    // Рендер данных
    reachVal.textContent = `${formatNum(estimatedReachMin)} – ${formatNum(estimatedReachMax)} чел.`;
    leadsVal.textContent = `${minLeads} – ${maxLeads} лидов`;
    cplVal.textContent = `${formatMoney(cplMin)} – ${formatMoney(cplMax)}`;
    feeVal.textContent = `${formatMoney(fee)} / мес.`;

    // Рендер сплита
    barContext.style.width = split.context + '%';
    barTg.style.width = split.tg + '%';
    barRemarketing.style.width = split.remarketing + '%';

    pctContext.textContent = split.context + '%';
    pctTg.textContent = split.tg + '%';
    pctRemarketing.textContent = split.remarketing + '%';
  }

  budgetRange.addEventListener('input', updateCalculator);
  industrySelect.addEventListener('change', updateCalculator);
  goalRadios.forEach(r => r.addEventListener('change', updateCalculator));

  // Клик по фиксации медиаплана
  if (btnRequestPlan) {
    btnRequestPlan.addEventListener('click', () => {
      const budget = budgetDisplay.textContent;
      const indText = industrySelect.options[industrySelect.selectedIndex].text;
      
      const clientNote = document.getElementById('clientNote');
      if (clientNote) {
        clientNote.value = `Запрос медиаплана по калькулятору:\nОтрасль: ${indText}\nПлановый бюджет: ${budget}\nЖелаем зафиксировать условия в договоре.`;
      }

      const clientBudget = document.getElementById('clientBudget');
      if (clientBudget) {
        const val = parseInt(budgetRange.value, 10);
        if (val < 300000) clientBudget.value = '150-300';
        else if (val <= 600000) clientBudget.value = '300-600';
        else if (val <= 1500000) clientBudget.value = '600-1500';
        else clientBudget.value = '1500+';
      }

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        const nameField = document.getElementById('clientName');
        if (nameField) nameField.focus();
      }

      showToast('Параметры калькулятора перенесены в заявку на аудит');
    });
  }

  updateCalculator();
}

/* ==========================================================================
   4. FAQ АККОРДЕОН
   ========================================================================== */
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-btn');

  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const content = btn.nextElementSibling;

      // Закрыть остальные
      faqButtons.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          if (otherBtn.nextElementSibling) {
            otherBtn.nextElementSibling.classList.remove('open');
          }
        }
      });

      // Переключить текущий
      btn.setAttribute('aria-expanded', !isExpanded);
      if (content) {
        content.classList.toggle('open', !isExpanded);
      }
    });
  });
}

/* ==========================================================================
   5. КОПИРОВАНИЕ РЕКВИЗИТОВ ДЛЯ БУХГАЛТЕРИИ
   ========================================================================== */
function initCopyRequisites() {
  const btn = document.getElementById('btnCopyRequisites');
  if (!btn) return;

  const requisitesText = `РЕКВИЗИТЫ КОНТРАГЕНТА:
Индивидуальный предприниматель Пряхин Матвей Викторович
Основной вид деятельности: ОКВЭД 73.11 «Деятельность рекламных агентств»
Дополнительные ОКВЭД: 73.12, 73.20
ИНН: 772849182049
ОГРНИП: 324774600189234
Система налогообложения: УСН (доходы), без НДС
Банк: АО «ТБанк»
Расчетный счет: 40802810900005847120
БИК: 044525974
Корр. счет: 30101810145250000974
ЭДО: Диадок / СБИС (ID: 2BM-772849182049-772801001-2024)`;

  btn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(requisitesText);
      } else {
        // Фоллбэк
        const textarea = document.createElement('textarea');
        textarea.value = requisitesText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Реквизиты ИП Пряхин М. В. скопированы в буфер обмена');
    } catch (err) {
      showToast('Реквизиты подготовлены для договора');
    }
  });
}

/* ==========================================================================
   6. ФОРМА ЗАЯВКИ И МОДАЛЬНОЕ ОКНО
   ========================================================================== */
function initLeadForm() {
  const form = document.getElementById('leadForm');
  const modal = document.getElementById('successModal');
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('modalOverlay');
  const ticketNum = document.getElementById('ticketNum');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Генерация номера обращения
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    if (ticketNum) {
      ticketNum.textContent = `REQ-2026-${randomNum}`;
    }

    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }

    form.reset();
  });

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   7. ВСПЛЫВАЮЩИЕ УВЕДОМЛЕНИЯ (TOAST)
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3800);
}

/* ==========================================================================
   8. ПЛАВНАЯ НАВИГАЦИЯ
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
