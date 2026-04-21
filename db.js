import * as SQLite from 'expo-sqlite';

let db = null;

const openDatabase = async (name) => {
  if (typeof SQLite.openDatabaseAsync === 'function') {
    return SQLite.openDatabaseAsync(name);
  }

  if (typeof SQLite.openDatabaseSync === 'function') {
    return SQLite.openDatabaseSync(name);
  }

  if (typeof SQLite.openDatabase === 'function') {
    return SQLite.openDatabase(name);
  }

  throw new Error('No supported SQLite open method found.');
};

const isModernDb = (database) => typeof database?.runAsync === 'function';
const isLegacyDb = (database) => typeof database?.transaction === 'function';

const getRowsFromResult = (result) => {
  if (Array.isArray(result)) {
    return result;
  }
  if (result?.rows && typeof result.rows.length === 'number') {
    const rows = [];
    for (let i = 0; i < result.rows.length; i++) {
      rows.push(result.rows.item(i));
    }
    return rows;
  }
  return [];
};

const executeSqlLegacy = (database, query, params = []) => {
  return new Promise((resolve, reject) => {
    database.transaction(
      (tx) => {
        tx.executeSql(
          query,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      reject
    );
  });
};

export const initDB = async () => {
  try {
    if (!db) {
      db = await openDatabase('app.db');
      console.log('SQLite open method used:',
        typeof SQLite.openDatabaseAsync === 'function' ? 'openDatabaseAsync' :
        typeof SQLite.openDatabaseSync === 'function' ? 'openDatabaseSync' :
        typeof SQLite.openDatabase === 'function' ? 'openDatabase' : 'none'
      );
    }

    if (typeof db.execAsync === 'function') {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          avatarUrl TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          content TEXT NOT NULL
        );
      `);
    } else if (typeof db.execSync === 'function') {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          avatarUrl TEXT DEFAULT ''
        );
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          content TEXT NOT NULL
        );
      `);
    } else if (isLegacyDb(db)) {
      await executeSqlLegacy(db, `
        CREATE TABLE IF NOT EXISTS accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          avatarUrl TEXT DEFAULT ''
        );
      `);
      await executeSqlLegacy(db, `
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          content TEXT NOT NULL
        );
      `);
    } else {
      throw new Error('SQLite database instance has no supported execute API.');
    }

    console.log('Database initialized');
    return db;
  } catch (error) {
    console.log('Error initializing database:', error);
    throw error;
  }
};

const ensureDb = async () => {
  if (!db) {
    await initDB();
  }
  return db;
};

export const dbExecute = async (query, params = []) => {
  try {
    const database = await ensureDb();

    if (isModernDb(database)) {
      if (typeof database.runAsync === 'function') {
        return await database.runAsync(query, ...params);
      }
      if (typeof database.runSync === 'function') {
        return database.runSync(query, ...params);
      }
    }

    if (isLegacyDb(database)) {
      return await executeSqlLegacy(database, query, params);
    }

    throw new Error('SQLite execute method not supported.');
  } catch (error) {
    console.log('Execute error:', error);
    throw error;
  }
};

export const dbGetOne = async (query, params = []) => {
  try {
    const database = await ensureDb();

    if (typeof database.getFirstAsync === 'function') {
      return await database.getFirstAsync(query, ...params);
    }

    if (typeof database.getFirstSync === 'function') {
      return database.getFirstSync(query, ...params);
    }

    const result = await dbExecute(query, params);
    const rows = getRowsFromResult(result);
    return rows[0] || null;
  } catch (error) {
    console.log('GetOne error:', error);
    throw error;
  }
};

export const dbQuery = async (query, params = []) => {
  try {
    const database = await ensureDb();

    if (typeof database.getAllAsync === 'function') {
      return await database.getAllAsync(query, ...params);
    }

    if (typeof database.getAllSync === 'function') {
      return database.getAllSync(query, ...params);
    }

    const result = await dbExecute(query, params);
    return getRowsFromResult(result);
  } catch (error) {
    console.log('Query error:', error);
    throw error;
  }
};

export default db;


        
        
        
    
