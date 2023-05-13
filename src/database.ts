const mysql = require('mysql');

export const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'web_scrapping'
});

connection.connect((err: string) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to database!');
});

export const createTableIfNotExists = (tableName: string) => {
  const sql = `CREATE TABLE IF NOT EXISTS ${tableName.replaceAll(' ', '_')} (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ranking VARCHAR(255) NOT NULL
  );`;

  connection.query(sql, (error: any) => {
    if (error) throw error;
    console.log(`Table ${tableName} created or already exists.`);
  });
};

