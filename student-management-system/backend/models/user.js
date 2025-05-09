const { pool } = require('../config/db');
const bcrypt = require('bcrypt')

class User {
    static async create(name, email, password, role = 'user') {
        try{

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const result = await  pool.query(
                'INSERT INTO users (name, email, password, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role',
                [name, email, hashedPassword, role]
            );
            return result.rows[0];
        }catch(error){
            console.error('Error in User.create: ', error.message);
            throw new Error('Failed to create user');
        }

    }
    
        static async findByEmail(email){
            try{
                const result = await pool.query(
                    'SELECT * FROM users WHERE email=$1',
                     [email]
                );
                return result.rows[0];
            }catch(error){
                console.error('Error in the User.findByEmail: ', error.message);
                throw new Error('Failed to find user by email');
            }
        }
    }


module.exports = User;