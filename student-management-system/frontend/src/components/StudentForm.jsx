import React, { useState } from 'react';
import axios from 'axios';



function StudentForm(){
    const [form, setForm] = useState({name:'', email: '', grade:''});

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/students', form, 
            {headers: {Authorization: token}}
        );
        alert('Student Added!');

    };


    return(
        <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-md">
            <h2 className="text-2xl mb-4">Add Student</h2>
            <input
            className="w-full p-2 mb-2 border"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
            className="w-full p-2 mb-2 border"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
            className="w-full p-2 mb-2 border"
            placeholder="Grade"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value })}
            />

            <button 
            className="bg-green-500 text-white p-2" 
            onClick={handleSubmit}>
                Add
            </button>

        </div>
    );
}

export default StudentForm;