/**
 * Rubik Card Club - Centralized User Data & Identity Cache Manager
 * Preserves player identity, username, avatar, preferences, game statistics,
 * and recent room history with localStorage caching and cross-tab synchronization.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RubikUserCache = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'rubik_user_profile_v2';
  const AVATARS = ['👑', '♠', '🦊', '🦅', '🦝', '🐭', '🦁', '🎲', '♟️', '⚡', '🌟', '💎'];

  function generateUUID() {
    return 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function getInitialProfile() {
    // Attempt migration from legacy localStorage keys
    let legacyName = '';
    try {
      legacyName = localStorage.getItem('rubik_player_name') ||
                   localStorage.getItem('catan_player_name') ||
                   localStorage.getItem('hokm_player_name') ||
                   localStorage.getItem('shelem_player_name') ||
                   localStorage.getItem('rubik_bg_player_name') || '';
    } catch (e) {}

    const defaultName = (legacyName && legacyName.trim()) ? legacyName.trim() : 'Player';
    let defaultLang = 'fa';
    let defaultSound = true;
    try {
      defaultLang = localStorage.getItem('rubik_card_lang') || 'fa';
      defaultSound = localStorage.getItem('rubik_card_sound') !== 'false';
    } catch (e) {}

    return {
      userId: generateUUID(),
      username: defaultName,
      avatar: '👑',
      created: Date.now(),
      lastActive: Date.now(),
      preferences: {
        lang: defaultLang,
        sound: defaultSound,
        cardTheme: 'classic'
      },
      stats: {
        totalGames: 0,
        totalWins: 0,
        games: {
          root: { played: 0, wins: 0, factionWins: { marquise: 0, eyrie: 0, alliance: 0, vagabond: 0 } },
          hokm: { played: 0, wins: 0, kotCount: 0 },
          shelem: { played: 0, wins: 0, slamCount: 0 },
          catan: { played: 0, wins: 0, maxVP: 0 },
          chess: { played: 0, wins: 0 },
          uno: { played: 0, wins: 0 },
          backgammon: { played: 0, wins: 0, marsWins: 0 },
          ludo: { played: 0, wins: 0 },
          'bughouse-chess': { played: 0, wins: 0 },
          'dots-and-boxes': { played: 0, wins: 0 }
        }
      },
      recentRooms: []
    };
  }

  let profileCache = null;
  const changeListeners = new Set();

  function loadProfile() {
    if (typeof localStorage === 'undefined') return getInitialProfile();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.userId) {
          // Merge with initial in case new fields were added
          const initial = getInitialProfile();
          profileCache = {
            ...initial,
            ...parsed,
            preferences: { ...initial.preferences, ...(parsed.preferences || {}) },
            stats: {
              ...initial.stats,
              ...(parsed.stats || {}),
              games: {
                ...initial.stats.games,
                ...((parsed.stats && parsed.stats.games) || {})
              }
            }
          };
          return profileCache;
        }
      }
    } catch (err) {
      console.warn('Error reading Rubik user profile from cache:', err);
    }
    profileCache = getInitialProfile();
    saveProfile(profileCache);
    return profileCache;
  }

  function saveProfile(newProfile, broadcast = true) {
    if (!newProfile) return;
    newProfile.lastActive = Date.now();
    profileCache = newProfile;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
        // Keep legacy keys in sync for backward compatibility
        localStorage.setItem('rubik_player_name', newProfile.username);
        localStorage.setItem('catan_player_name', newProfile.username);
        localStorage.setItem('hokm_player_name', newProfile.username);
        localStorage.setItem('shelem_player_name', newProfile.username);
        localStorage.setItem('rubik_bg_player_name', newProfile.username);
        if (newProfile.preferences) {
          localStorage.setItem('rubik_card_lang', newProfile.preferences.lang);
          localStorage.setItem('rubik_card_sound', newProfile.preferences.sound ? 'true' : 'false');
        }
      } catch (err) {
        console.warn('Error saving Rubik user profile to cache:', err);
      }
    }

    if (broadcast) {
      notifyListeners(newProfile);
      syncWithServer(newProfile);
    }
  }

  function notifyListeners(profile) {
    changeListeners.forEach(fn => {
      try { fn(profile); } catch (e) { console.error(e); }
    });
  }

  // Cross-tab sync
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          profileCache = JSON.parse(e.newValue);
          notifyListeners(profileCache);
        } catch (err) {}
      }
    });
  }

  // Async server sync (fire-and-forget)
  function syncWithServer(profile) {
    if (typeof fetch === 'undefined') return;
    try {
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      }).catch(() => {});
    } catch (e) {}
  }

  // Public API
  return {
    getAvatars: () => [...AVATARS],

    getProfile: function () {
      if (!profileCache) loadProfile();
      return { ...profileCache };
    },

    getUsername: function () {
      const p = this.getProfile();
      return p.username || 'Player';
    },

    setUsername: function (newName) {
      const p = this.getProfile();
      const clean = String(newName || '').trim().substring(0, 20);
      if (!clean) return;
      p.username = clean;
      saveProfile(p);
      return clean;
    },

    setAvatar: function (avatar) {
      const p = this.getProfile();
      if (AVATARS.includes(avatar)) {
        p.avatar = avatar;
        saveProfile(p);
      }
    },

    setPreference: function (key, value) {
      const p = this.getProfile();
      p.preferences = p.preferences || {};
      p.preferences[key] = value;
      saveProfile(p);
    },

    recordMatchResult: function (gameId, isWin, extraData = {}) {
      const p = this.getProfile();
      p.stats = p.stats || { totalGames: 0, totalWins: 0, games: {} };
      p.stats.totalGames = (p.stats.totalGames || 0) + 1;
      if (isWin) p.stats.totalWins = (p.stats.totalWins || 0) + 1;

      if (!p.stats.games[gameId]) {
        p.stats.games[gameId] = { played: 0, wins: 0 };
      }
      const g = p.stats.games[gameId];
      g.played = (g.played || 0) + 1;
      if (isWin) g.wins = (g.wins || 0) + 1;

      // Game specific stats
      if (gameId === 'root' && extraData.faction) {
        g.factionWins = g.factionWins || { marquise: 0, eyrie: 0, alliance: 0, vagabond: 0 };
        if (isWin && g.factionWins[extraData.faction] !== undefined) {
          g.factionWins[extraData.faction]++;
        }
      }
      if (gameId === 'catan' && extraData.vp) {
        g.maxVP = Math.max(g.maxVP || 0, extraData.vp);
      }

      saveProfile(p);
    },

    addRecentRoom: function (roomCode, gameType) {
      const p = this.getProfile();
      p.recentRooms = p.recentRooms || [];
      p.recentRooms = p.recentRooms.filter(r => r.code !== roomCode);
      p.recentRooms.unshift({
        code: roomCode,
        gameType,
        joinedAt: Date.now()
      });
      if (p.recentRooms.length > 5) {
        p.recentRooms = p.recentRooms.slice(0, 5);
      }
      saveProfile(p);
    },

    onProfileChange: function (listener) {
      if (typeof listener === 'function') {
        changeListeners.add(listener);
        if (profileCache) listener(profileCache);
      }
      return () => changeListeners.delete(listener);
    },

    resetStats: function () {
      const p = this.getProfile();
      const initial = getInitialProfile();
      p.stats = initial.stats;
      p.recentRooms = [];
      saveProfile(p);
    }
  };
});
