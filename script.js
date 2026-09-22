/* ============================================================
   交互脚本：主题切换、滚动揭示、鼠标光斑、导航高亮、数字滚动
   纯前端，无后端依赖。
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. 深浅色主题切换（记忆选择） ---------- */
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  if (saved) root.setAttribute("data-theme", saved);

  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- 2. 金色星尘粒子 ---------- */
  var stars = document.getElementById("stars");
  if (stars && !reduceMotion) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 90; i++) {
      var s = document.createElement("span");
      var size = Math.random() * 2.2 + 1;
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDuration = (Math.random() * 3 + 2) + "s";
      s.style.animationDelay = (-Math.random() * 5) + "s";
      frag.appendChild(s);
    }
    stars.appendChild(frag);
  }

  /* ---------- 3. 跟随鼠标的光斑 ---------- */
  var glow = document.getElementById("cursorGlow");
  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var cx = tx, cy = ty;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
    });
    (function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  } else if (glow) {
    glow.style.display = "none";
  }

  /* ---------- 4. 滚动揭示 + 技能条 + 数字滚动 ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var dur = 1200, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealEls = document.querySelectorAll(".reveal, .bar");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("in");
        var num = el.querySelector("[data-count]");
        if (num) animateCount(num);
        io.unobserve(el);
      });
    }, { threshold: 0.18 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 5. 导航滚动高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
