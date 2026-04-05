import SQLite from "react-native-sqlite-storage";
const db = SQLite.openDatabase(
    {
        name: "app.db",
        location:"default",
    },
    () => {
        console.log("Db open")
    },
    (open) => {
        console.log("Error",error);
        
    }
) ;
export default db ;

        
        
        
    
