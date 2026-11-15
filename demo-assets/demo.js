/* ═══════════════════════════════════════════════════════════════════════
   Emerge.js — utilitários partilhados das demos
   · Persistência do tema claro/escuro (checkbox #theme-switch)
   · Replay genérico de entradas (galerias)
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  var KEY = "emerge-demo-theme";

  function saved() {
    try { return localStorage.getItem(KEY) === "dark"; } catch (e) { return false; }
  }

  /* Aplica o tema guardado antes do primeiro paint (script no <head>) */
  document.documentElement.classList.toggle("theme-dark", saved());

  document.addEventListener("DOMContentLoaded", function () {
    var box = document.getElementById("theme-switch");
    if (!box) return;
    box.checked = document.documentElement.classList.contains("theme-dark");
    box.addEventListener("change", function () {
      var dark = box.checked;
      document.documentElement.classList.toggle("theme-dark", dark);
      try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch (e) { /* modo privado */ }
    });
  });

  /* Helper global: reinicia a entrada de um elemento (cartões “Repetir”) */
  window.EmergeDemo = {
    replay: function (el) {
      var cls = (window.Emerge && Emerge.options && Emerge.options.animatedClassName) || "emerge-animate";
      el.classList.remove(cls);
      void el.offsetWidth;
      requestAnimationFrame(function () { el.classList.add(cls); });
    }
  };
})();
