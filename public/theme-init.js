(function () {
  try {
    var raw = localStorage.getItem('condupro:theme');
    var mode = 'system';
    if (raw) {
      var parsed = JSON.parse(raw);
      mode = (parsed.state && parsed.state.mode) || parsed.mode || 'system';
    }
    var dark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {
    /* ignore */
  }
})();
