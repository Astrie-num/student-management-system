const express = require('express');
const router = express.Router();
const User = require('../models/user');
const student = require('../models/student');
const jwt = require('jsonwebtoken');
const OTP = require('../middlewares/otp');
const { sendOTP} = require('../utils/sendOTP');
const {auth, authorizeRole} = require('../middlewares/auth');
const Student = require('../models/student');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { parse } = require('dotenv');

require('dotenv').config();

let otpStore = {};


router.post('/register', async(req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({message: "All fields are required"});
    }

    if (!/^[a-zA-Z\s]{2,50}$/.test(name)) {
        return res.status(400).json({ message: 'Name must be 2-50 characters long and contain only letters and spaces' });
      }

    if (!validator.isEmail(email)) {
       return res.status(400).json({ message: 'Invalid email format' });
    }


    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
        });
    }


    const existingUser = await User.findByEmail(email);
    if(existingUser){
        return res.status(400).json({message: "Email already in use"});
    }

    const otp = OTP.generate();
    otpStore[email] = {otp, timestamp: Date.now()};
    const sent = await sendOTP(email, otp);
    if(!sent) {
       return res.status(500).json({message: "Failed to send OTP"})
    }
    res.status(200).json({ message: 'OTP sent to email' });

});



// verify OTP and register

router.post('/verify-otp', async (req, res) => {

    try{
        const {email, otp, password} = req.body;
        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'Email, OTP and password are required' });
        }
    
        const stored = otpStore[email];
        if(!stored){
            return res.status(400).json({message: "OTP not found"});
        }
    
        if(Date.now() - stored.timestamp > 3600000){
            delete otpStore[email];
            return res.status(400).json({message: "OTP has expired"});
        }
    
        if(!OTP.verify(otp, stored.otp)){
            return res.status(400).json({message: "Invalid OTP!"});
        }
    
        const user = await User.create (req.body.name, email, password);
        delete otpStore[email];
        const token = jwt.sign(
            { id: user.id,
              role: user.role
             },
            process.env.JWT_SECRET,
        {expiresIn: '1h'});
        res.status(201).json({token, user});
    }catch(error){
        console.error('Error in /verify-otp: ', error.message);
        res.status(500).json({message: 'Internal server error'});
    }
});




//login

router.post('/login', async(req, res) => {
    try{
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials!' });
    }


    if(!user || !user.password){
       return res.status(401).json({message: "Invalid credentials!"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Passwords do not match!' });
        }


    const otp = OTP.generate();
    otpStore[email] = {otp, timestamp: Date.now()};
    const sent = await sendOTP(email, otp);
    if(!sent){
        return res.status(500).json({message: "Failed to send OTP"});
    }
    res.status(200).json({message : "OTP sent for verification"});
    }catch(error){
        console.error('Error in /login:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// verify login
router.post('/verify-login', async(req, res) => {
    const {email, otp} = req.body;
    const stored = otpStore[email];
    if(!stored){
        return res.status(400).json({message: "OTP not found"});
    }

    if(Date.now() - stored.timestamp > 3600000){
        delete otpStore[email];
        return res.status(400).json({message: "OTP has expired"});
    }

    if(!OTP.verify(stored.otp, otp)) {
        return res.status(400).json({message : "Invalid OTP"});
    }


    const user = await User.findByEmail(email);
    const token = jwt.sign(
        {id: user.id,
         role: user.role
        },
        process.env.JWT_SECRET,
        {expiresIn:'1h'}
    );
    delete otpStore[email];
    res.status(200).json({token, user});
});



// CRUD Operations
router.get('/students', async(req, res) => {
    try{
        const {page = 1, limit =5, search = ''} = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
    
        if(isNaN(pageNum)) {
            return res.status(400).json({
                error:'Invalid Parameter',
                message: 'Page must be a positive integer'
            });
        }
    
        const result = await Student.findAll(pageNum, limitNum, search);
        res.status(200).json(result);
    }catch(error){
        console.error('Error at /students: ', error.message);
        res.status(500).json({
            error:'Internal Server Error',
            message: 'An unexpected error occured'
        });
    }

});

router.post('/students', auth, authorizeRole('admin'), async (req, res) => {
    try{

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Request body is empty or missing'
            });
        }

        const {name, email, grade} = req.body;
        if (!name || !email || !grade) {
            return res.status(400).json({ message: 'Name, email, and grade are required' });
        }

        const existingStudent = await Student.findByEmail(email);
        if (existingStudent) {
            return res.status(400).json({ message: 'A student with this email already exists' });
        }

        const student = await Student.create(name, email, grade);
        res.status(201).json(student);

        }catch(error){
        console.error("Error in api/students POST: ", error.message);
        if(error.message === 'A student with this email already exists'){
            return res.status(400).json({message: error.message});
        }

        res.status(500).json({message: "Failed to create student"});
    } 

});


router.get('/students/:id', auth, async(req, res) => {
    try{

        const studentId = parseInt(req.params.id, 10);
        if(isNaN(studentId) || studentId <=0){
            return res. status(400).jason({message: "Student id must be a positive integer"});
        }

        const student = await Student.findById(studentId);
        if(!student){
            return res.status(404).json({message : "Student not found"});
        }
        res.json(student);

    }catch(error){
        console.error(`Error in /students/${req.params.id}: `, error.message);
        if(error.message === 'Failed to find student by ID'){
            return res.status(500).json({error: 'Database Error', message: "An error occured while fetching the student"});

        }
        return res.status(500).json({error:"Internal Server Error", message: "An unexpected error occured"});
    }
});


router.put('/students/:id', auth, authorizeRole('admin'), async(req, res) => {
    try{
        console.log(`Processing PUT /students/${req.params.id}`);       
        const studentId = parseInt(req.params.id, 10);
        if(isNaN(studentId) || studentId <=0) {
            return res.status(400).json({
                error: 'Invalid ID',
                message: 'Student ID must be a positive integer'
            });
        }

        const {name, email, grade} = req.body;
        console.log('Update request body:', { studentId, name, grade, email });

        if(!name || !email || !grade) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Atleast one field must be provided for updating'
            });
        }

        if (email && !validator.isEmail(email)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid email format'
            });
        }

        const student = await Student.update(studentId, name, email, grade );
        if(!student) {
            return res.status(404).json({
                error: 'Not Found',
                message : "Student not found!"
            });
        }
        res.status(200).json(student);

    }catch(error){
        console.error(`Error in PUT /students/${req.params.id}:`, error.message);
        if (error.message === 'Failed to update student') {
            return res.status(500).json({
                error: 'Database Error',
                message: 'An error occurred while updating the student'
            });
        } else if (error.message === 'A student with this email already exists') {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A student with this email already exists'
            });
        }
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
        });
    }
});


router.delete('/students/:id', auth, authorizeRole('admin'), async(req, res) => {
    await Student.delete (req.params.id);
    res.status(204).json();
});


module.exports = router;