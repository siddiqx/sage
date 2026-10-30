/**
 * Sage — Personal Knowledge Website
 * Application Core & State Management
 */

(function () {
  'use strict';

  // Global SAGE namespace
  window.SAGE = window.SAGE || {
    subjects: [],
    topics: {},
    modulesBySubject: {},
    
    // Registration methods
    registerSubject: function (subject) {
      if (!this.subjects.some(s => s.id === subject.id)) {
        this.subjects.push(subject);
      }
    },
    
    registerTopic: function (topic) {
      this.topics[topic.id] = topic;
      
      // Index by subject & module
      if (!this.modulesBySubject[topic.subject]) {
        this.modulesBySubject[topic.subject] = {};
      }
      if (!this.modulesBySubject[topic.subject][topic.module]) {
        this.modulesBySubject[topic.subject][topic.module] = [];
      }
      if (!this.modulesBySubject[topic.subject][topic.module].some(t => t.id === topic.id)) {
        this.modulesBySubject[topic.subject][topic.module].push(topic);
      }
    },

    getTopic: function (id) {
      return this.topics[id] || null;
    },

    getSubject: function (id) {
      return this.subjects.find(s => s.id === id) || null;
    }
  };

  // State Management via localStorage
  const STORAGE_KEYS = {
    THEME: 'sage_theme',
    BOOKMARKS: 'sage_bookmarks',
    COMPLETED: 'sage_completed',
    RECENT: 'sage_recent'
  };

  const Store = {
    getTheme: function () {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },

    setTheme: function (theme) {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
      const icon = document.querySelector('.theme-toggle-icon');
      if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
      }
    },

    toggleTheme: function () {
      const current = this.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      this.setTheme(next);
    },

    getBookmarks: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) || [];
      } catch (e) {
        return [];
      }
    },

    toggleBookmark: function (topicId) {
      let b = this.getBookmarks();
      const idx = b.indexOf(topicId);
      if (idx > -1) {
        b.splice(idx, 1);
      } else {
        b.push(topicId);
      }
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(b));
      this.updateBookmarkUI();
      return idx === -1; // true if added
    },

    isBookmarked: function (topicId) {
      return this.getBookmarks().includes(topicId);
    },

    getCompleted: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED)) || [];
      } catch (e) {
        return [];
      }
    },

    toggleCompleted: function (topicId) {
      let c = this.getCompleted();
      const idx = c.indexOf(topicId);
      if (idx > -1) {
        c.splice(idx, 1);
      } else {
        c.push(topicId);
      }
      localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(c));
      this.updateCompletedUI();
      return idx === -1; // true if completed
    },

    isCompleted: function (topicId) {
      return this.getCompleted().includes(topicId);
    },

    getRecent: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT)) || [];
      } catch (e) {
        return [];
      }
    },

    addRecent: function (topicId) {
      let r = this.getRecent();
      r = r.filter(id => id !== topicId);
      r.unshift(topicId);
      if (r.length > 10) r.pop();
      localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(r));
    },

    updateBookmarkUI: function () {
      const count = this.getBookmarks().length;
      const badge = document.querySelector('.bookmark-count-badge');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
      }
      
      const activeTopic = SAGE.activeTopicId;
      const btn = document.querySelector('.btn-bookmark-topic');
      if (btn && activeTopic) {
        const isB = this.isBookmarked(activeTopic);
        btn.classList.toggle('active', isB);
        btn.innerHTML = isB ? '★ Bookmarked' : '☆ Bookmark';
      }
    },

    updateCompletedUI: function () {
      const activeTopic = SAGE.activeTopicId;
      const btn = document.querySelector('.btn-complete-topic');
      if (btn && activeTopic) {
        const isC = this.isCompleted(activeTopic);
        btn.classList.toggle('active', isC);
        btn.innerHTML = isC ? '✓ Mastered' : '○ Mark as Mastered';
      }

      // Update sidebar badges
      document.querySelectorAll('.nav-topic-status').forEach(el => {
        const id = el.dataset.topicId;
        if (id) {
          const isC = this.isCompleted(id);
          el.classList.toggle('completed', isC);
          el.textContent = isC ? '✓' : '';
        }
      });
    }
  };

  SAGE.Store = Store;

  // Initialize theme on load
  document.addEventListener('DOMContentLoaded', function () {
    Store.setTheme(Store.getTheme());
    Store.updateBookmarkUI();

    // Theme toggle click
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => Store.toggleTheme());
    }

    // Mobile nav toggle
    const mobileBtn = document.getElementById('mobile-nav-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Global keyboard shortcuts
    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        SAGE.Search && SAGE.Search.openModal();
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        SAGE.Search && SAGE.Search.openModal();
      } else if (e.key === 'Escape') {
        SAGE.Search && SAGE.Search.closeModal();
        const bDrawer = document.getElementById('bookmarks-modal');
        if (bDrawer) bDrawer.classList.remove('open');
      }
    });

    // Bookmarks drawer toggle
    const bBtn = document.getElementById('bookmarks-trigger-btn');
    if (bBtn) {
      bBtn.addEventListener('click', () => SAGE.Render.openBookmarksModal());
    }
  });

})();
