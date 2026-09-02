/* La Doña Santa — seamless fade-to-white page transitions.
   - On load: the page fades IN from white.
   - On internal navigation: the page fades OUT to white, then moves.
   window.ldsFadeTo(url) is exposed so script-driven redirects use it too. */
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fade;

  function mount(){
    fade = document.getElementById('lds-fade');
    if(!fade){
      fade = document.createElement('div');
      fade.id = 'lds-fade';
      document.body.appendChild(fade);
    }
    fadeIn();
  }
  function fadeIn(){
    // start opaque, then release on the next frame so the transition runs
    fade.classList.remove('cover');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ fade.classList.add('gone'); }); });
  }
  function fadeTo(url){
    if(!url) return;
    if(RM){ location.href = url; return; }
    fade.classList.remove('gone');
    fade.classList.add('cover');
    var done = false;
    function go(){ if(done) return; done = true; location.href = url; }
    fade.addEventListener('transitionend', go, { once:true });
    setTimeout(go, 820); // safety net if transitionend never fires
  }
  window.ldsFadeTo = fadeTo;

  // fade back in when returning via the back/forward cache
  addEventListener('pageshow', function(e){ if(e.persisted && fade) fadeIn(); });

  // intercept same-document link clicks (capture phase, before page handlers)
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a') : null;
    if(!a) return;
    var href = a.getAttribute('href');
    if(!href || href === '#') return;                    // JS hooks / no target
    if(a.target && a.target !== '_self') return;         // new tab / frame
    if(a.hasAttribute('download')) return;
    if(href.charAt(0) === '#') return;                   // in-page anchor
    if(/^(mailto:|tel:|javascript:)/i.test(href)) return;
    if(/^https?:\/\//i.test(href)) return;               // external — leave it
    if(e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    fadeTo(href);
  }, true);

  if(document.body) mount();
  else addEventListener('DOMContentLoaded', mount);
})();

/* Never let a frame-sequence page's "loading" indicator linger.
   The background frames keep preloading in the background; the message only needs
   to cover the first paint. Hides shortly after the page is ready, with a hard
   fallback so a single slow/failed frame can't leave the text stuck on screen. */
(function(){
  function hideLoader(){
    var l = document.getElementById('loading');
    if(!l) return;
    l.style.opacity = '0';
    setTimeout(function(){ if(l && l.parentNode) l.remove(); }, 600);
  }
  function arm(){ setTimeout(hideLoader, 1400); }
  if(document.readyState === 'complete') arm();
  else addEventListener('load', arm);
  setTimeout(hideLoader, 6000); // hard fallback
})();
