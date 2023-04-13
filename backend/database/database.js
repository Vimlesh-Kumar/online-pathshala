// const mysql=require('mysql')
// require("dotenv").config();

// const connection=mysql.createConnection({
//     port:process.env.DB_PORT,
//     host:process.env.DB_HOST,
//     user:process.env.DB_USER,
//     password:process.env.DB_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//     connectionLimit:10
// })

// // connection.connect((error) => {
// //     if (error) {
// //         console.error('Error connecting to MySQL database: ' + error.stack);
// //         return;
// //     }

// //     console.log('Connected to MySQL database with ID ' + connection.threadId);

// //     const createTableQuery = `
// //     CREATE TABLE students (
// //       id INT(11) NOT NULL AUTO_INCREMENT,
// //       first_name VARCHAR(255) NOT NULL,
// //       last_name VARCHAR(255) NOT NULL,
// //       email VARCHAR(255) NOT NULL,
// //       password VARCHAR(255) NOT NULL,
// //       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// //       PRIMARY KEY (id)
// //     )`;

// // });

// // connection.query('SELECT * FROM users', (error, results, fields) => {
// //     if (error) throw error;

// //     console.log('The results are: ', results);
// // });

// connection.connect((error) => {
//     if (error) {
//         console.error('Error connecting to MySQL database: ' + error.stack);
//         return;
//     }

//     console.log('Connected to MySQL database with ID ' + connection.threadId);

//     const createTableQuery = `
//     CREATE TABLE IF NOT EXISTS users (
//       id INT(11) NOT NULL AUTO_INCREMENT,
//       first_name VARCHAR(255) NOT NULL,
//       last_name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       password VARCHAR(255) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY (id)
//     ),

//      CREATE TABLE IF NOT EXISTS STD (
//       id INT(11) NOT NULL AUTO_INCREMENT,
//       first_name VARCHAR(255) NOT NULL,
//       last_name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       password VARCHAR(255) NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       PRIMARY KEY (id)
//     )
//   `;

  

//     connection.query(createTableQuery, (error, results, fields) => {
//         if (error) throw error;

//         console.log('The users table has been created successfully.');
//     });

//     // connection.end((error) => {
//     //     if (error) {
//     //         console.error('Error closing the MySQL database connection: ' + error.stack);
//     //         return;
//     //     }

//     //     console.log('MySQL database connection closed successfully.');
//     // });
// });