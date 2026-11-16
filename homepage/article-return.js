const back = document.querySelector(".reading-back");
back.addEventListener("click", (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey
    || !document.referrer || history.length < 2) return;
  const referrer = new URL(document.referrer);
  const shelf = new URL(back.href);
  if (referrer.origin === shelf.origin && referrer.pathname === shelf.pathname) {
    event.preventDefault();
    history.back();
  }
});
