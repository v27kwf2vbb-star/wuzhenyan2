const homeView = document.querySelector('#home-view');
const pendingCards = document.querySelectorAll('.is-pending');
const knowledgeEntry = document.querySelector('#knowledge-entry');
const knowledgeDetail = document.querySelector('#knowledge-detail');
const detailClose = document.querySelector('#detail-close');
const pageTitle = document.querySelector('#page-title');
const toast = document.querySelector('#toast');

let toastTimer;

function showToast() {
  window.clearTimeout(toastTimer);
  toast.classList.add('is-visible');
  toast.setAttribute('aria-hidden', 'false');

  toastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.setAttribute('aria-hidden', 'true');
  }, 2400);
}

function openKnowledge() {
  window.clearTimeout(toastTimer);
  toast.classList.remove('is-visible');
  toast.setAttribute('aria-hidden', 'true');

  homeView.hidden = true;
  knowledgeDetail.hidden = false;
  knowledgeEntry.setAttribute('aria-expanded', 'true');
  document.body.classList.add('is-detail-open');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  window.requestAnimationFrame(() => detailClose.focus({ preventScroll: true }));
}

function closeKnowledge() {
  knowledgeDetail.hidden = true;
  homeView.hidden = false;
  knowledgeEntry.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('is-detail-open');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

  window.requestAnimationFrame(() => pageTitle.focus({ preventScroll: true }));
}

pendingCards.forEach((card) => {
  card.addEventListener('click', showToast);
});

knowledgeEntry.addEventListener('click', openKnowledge);
detailClose.addEventListener('click', closeKnowledge);
