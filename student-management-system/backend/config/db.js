const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'student-db',
    password: 'vinniastrie!7',
    port: 5432,
});


const initializeTables = async () => {
    try{
        await pool.query(
            `CREATE TABLE IF NOT EXISTS users(
            id SERIAL  PRIMARY KEY,
            name  VARCHAR (255) NOT NULL,
            email VARCHAR (255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user'
            );`
        );

        await pool.query(
            `CREATE TABLE IF NOT EXISTS students(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            grade VARCHAR(50) NOT NULL
            );`
        );

        console.log("Tables created successfully or already axist!");
    }catch(error){
        console.log('Error creating tables', error);
    }
};

initializeTables();

module.exports = { pool };