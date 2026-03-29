import *  as SQLite from "expo-sqlite" ;
let db = null ;
export const getdb = async() => {
if(!db) {
    db = await SQLite.openDatabaseAsync("app.db") ;
}
return db ;
}
export const initDB = async() => {
    const db = await getdb() ;
    await db.execAsync  
    ('
        CREATE TABLE IF NOT EXISTS users ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT ,
        email TEXT UNIQUE,
        password TEXT,
        avatarUrl TEXT,
    ) ;
    '
    );

        
        
        
    
}