const { pool } = require('../config/db');


class Student{
    static async create(name, email, grade){
        try{
            const query = ('INSERT INTO students (name, email, grade) VALUES ($1, $2, $3) RETURNING *');
            const values = [name, email, grade];
            const result = await pool.query(query, values);
            return result.rows[0];
        }catch(error){
            console.error('Error in student.create:', error.message);
            if(error.code === '23505'){
                throw new Error('A student with this email already exists');
            }

            throw new Error('Failed to create student');
        }
            
    }

    static async findAll(page=1,  limit=5, search='') {
        const offset = (page - 1) * limit;
        const query = 'SELECT * FROM students WHERE name ILIKE $1 OR email ILIKE $1 LIMIT $2 OFFSET $3';
        const values = [`%${search}%`, limit, offset];
        const result = await pool.query(query, values);
        const countQuery = 'SELECT COUNT(*) FROM students WHERE name ILIKE $1 OR email ILIKE $1';
        const countResult = await pool.query(countQuery, [`%${search}%`]);
        return {
            students: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            limit: parseInt(limit)
        };
    }

    static async findByEmail(email){
        const query = 'SELECT * FROM students WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id){
        const query = "SELECT * FROM students WHERE id=$1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }


    static async update(id, name, email, grade){
        try{
            const studentId = parseInt(id, 10);
        if (isNaN(studentId) || studentId <= 0) {
            throw new Error('Invalid student ID');
        }

        const query = 'UPDATE students SET name = COALESCE($2, name), email = COALESCE($3, email), grade = COALESCE($4, grade) WHERE id = $1 RETURNING *';
        const values = [studentId, name, email, grade];
        console.log('Executing update query:', query, 'with values:', values);
        const result = await pool.query(query, values);
        return result.rows[0];

        }catch(error){
            console.error('Error in Student.update:', error.message);
        if (error.code === '23505') {
            throw new Error('A student with this email already exists');
        }
        throw new Error('Failed to update student');
        }
    }


    static async delete(id) {
        const query = 'DELETE FROM students WHERE id=$1';
        await pool.query(query, [id]);
    }
}

module.exports = Student;