import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentList() {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://localhost:5000/api/students', {
                    headers: { Authorization: token },
                    params: { page, limit: 5, search },
                });
                setStudents(res.data.rows);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, [page, search]); // Dependencies are now correct

    return (
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-white shadow-md">
            <h2 className="text-2xl mb-4">Students</h2>
            <input
                className="w-full p-2 mb-2 border rounded"
                placeholder="Search by name"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
            />

            {students.length > 0 ? (
                students.map((student) => (
                    <div key={student.id} className="p-2 border-b">
                        <p>{student.name} - {student.grade}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No students found.</p>
            )}

            <div className="flex justify-between mt-4">
                <button
                    className={`p-2 ${page === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'} rounded`}
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </button>

                <button
                    className="bg-blue-500 text-white p-2 rounded"
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default StudentList;