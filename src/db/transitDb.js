/**
 * CityFlow Central Relational Storage Engine
 * Provides persistent transactional data store with multi-city support,
 * automated initial seeding, schema validation, and audit tracking.
 */

import { generateCitySeedData, DEFAULT_SYSTEM_SETTINGS, SEED_USERS } from './seedData.js';

const STORAGE_PREFIX = 'cityflow_v2';
const SETTINGS_KEY = `${STORAGE_PREFIX}_settings`;
const AUTH_KEY = `${STORAGE_PREFIX}_auth_session`;
const AUDIT_KEY = `${STORAGE_PREFIX}_audit_logs`;

// Supported Cities
export const SUPPORTED_CITIES = [
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', center: [28.6139, 77.2090] },
  { id: 'chennai', name: 'Chennai Metropolitan', state: 'Tamil Nadu', center: [13.0827, 80.2707] },
  { id: 'bangalore', name: 'Bangalore (BMTC)', state: 'Karnataka', center: [12.9716, 77.5946] }
];

export class TransitDatabase {
  constructor() {
    this.memoryCache = new Map();
    this.initDatabase();
  }

  getStorageKey(city, collection) {
    return `${STORAGE_PREFIX}_${city}_${collection}`;
  }

  initDatabase() {
    try {
      // Initialize Users if not present
      if (!localStorage.getItem(`${STORAGE_PREFIX}_users`)) {
        localStorage.setItem(`${STORAGE_PREFIX}_users`, JSON.stringify(SEED_USERS));
      }

      // Initialize System Settings if not present
      if (!localStorage.getItem(SETTINGS_KEY)) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
      }

      // Initialize Cities
      SUPPORTED_CITIES.forEach(city => {
        const checkKey = this.getStorageKey(city.id, 'drivers');
        if (!localStorage.getItem(checkKey)) {
          this.seedCityData(city.id);
        }
      });
    } catch (err) {
      console.warn('TransitDatabase initialization warning:', err);
    }
  }

  seedCityData(cityId) {
    const seed = generateCitySeedData(cityId);
    Object.keys(seed).forEach(collection => {
      const key = this.getStorageKey(cityId, collection);
      localStorage.setItem(key, JSON.stringify(seed[collection]));
      this.memoryCache.set(key, seed[collection]);
    });
  }

  // Generic Collection Retrieval
  getCollection(cityId, collectionName) {
    const key = this.getStorageKey(cityId, collectionName);
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        this.memoryCache.set(key, parsed);
        return parsed;
      }
    } catch (e) {
      console.error(`Error reading ${collectionName} for ${cityId}:`, e);
    }

    // If missing, seed and return
    this.seedCityData(cityId);
    return this.getCollection(cityId, collectionName);
  }

  // Generic Collection Save
  saveCollection(cityId, collectionName, items) {
    const key = this.getStorageKey(cityId, collectionName);
    this.memoryCache.set(key, items);
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error(`Error saving ${collectionName} for ${cityId}:`, e);
    }
  }

  // Find single item
  findById(cityId, collectionName, id) {
    const items = this.getCollection(cityId, collectionName);
    return items.find(item => item.id === id) || null;
  }

  // Filter items
  find(cityId, collectionName, predicate = () => true) {
    const items = this.getCollection(cityId, collectionName);
    return items.filter(predicate);
  }

  // Insert Record
  insert(cityId, collectionName, record, actor = 'System') {
    const items = this.getCollection(cityId, collectionName);
    const newRecord = {
      ...record,
      id: record.id || `${collectionName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newRecord, ...items];
    this.saveCollection(cityId, collectionName, updated);

    this.recordAuditLog({
      action: `CREATE_${collectionName.toUpperCase()}`,
      entityType: collectionName,
      entityId: newRecord.id,
      details: `Created new ${collectionName} record`,
      newValue: newRecord,
      oldValue: null,
      actor,
      cityId
    });

    return newRecord;
  }

  // Update Record
  update(cityId, collectionName, id, changes, actor = 'System') {
    const items = this.getCollection(cityId, collectionName);
    let oldRecord = null;
    const updated = items.map(item => {
      if (item.id === id) {
        oldRecord = { ...item };
        return {
          ...item,
          ...changes,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    this.saveCollection(cityId, collectionName, updated);

    if (oldRecord) {
      this.recordAuditLog({
        action: `UPDATE_${collectionName.toUpperCase()}`,
        entityType: collectionName,
        entityId: id,
        details: `Updated ${collectionName} fields: ${Object.keys(changes).join(', ')}`,
        newValue: changes,
        oldValue: oldRecord,
        actor,
        cityId
      });
    }

    return updated.find(i => i.id === id) || null;
  }

  // Remove Record
  remove(cityId, collectionName, id, actor = 'System') {
    const items = this.getCollection(cityId, collectionName);
    const existing = items.find(i => i.id === id);
    const filtered = items.filter(i => i.id !== id);
    this.saveCollection(cityId, collectionName, filtered);

    if (existing) {
      this.recordAuditLog({
        action: `DELETE_${collectionName.toUpperCase()}`,
        entityType: collectionName,
        entityId: id,
        details: `Deleted ${collectionName} record`,
        newValue: null,
        oldValue: existing,
        actor,
        cityId
      });
    }

    return true;
  }

  // Record Audit Trail
  recordAuditLog(entry) {
    try {
      const logs = this.getAuditLogs();
      const logEntry = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        ...entry
      };
      const updated = [logEntry, ...logs.slice(0, 199)];
      localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Audit log write error:', e);
    }
  }

  // Retrieve Audit Logs
  getAuditLogs(cityId = null) {
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!cityId) return parsed;
      return parsed.filter(l => !l.cityId || l.cityId === cityId);
    } catch {
      return [];
    }
  }

  // Global Settings API
  getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_SYSTEM_SETTINGS;
    } catch {
      return DEFAULT_SYSTEM_SETTINGS;
    }
  }

  updateSettings(newSettings, actor = 'Admin') {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    this.recordAuditLog({
      action: 'UPDATE_SETTINGS',
      entityType: 'settings',
      entityId: 'global',
      details: 'Updated operational parameters',
      newValue: newSettings,
      oldValue: current,
      actor,
      cityId: 'all'
    });
    return updated;
  }

  // Reset City to Fresh Seed
  resetCity(cityId) {
    this.seedCityData(cityId);
    this.recordAuditLog({
      action: 'RESET_DATABASE',
      entityType: 'city',
      entityId: cityId,
      details: `Database reset to initial factory seed for ${cityId}`,
      newValue: null,
      oldValue: null,
      actor: 'Admin',
      cityId
    });
  }
}

// Global Singleton Instance
export const db = new TransitDatabase();

