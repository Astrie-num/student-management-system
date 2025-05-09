import React from "react";
import StudentList from "../components/StudentList";
import StudentForm from "../components/StudentForm";


function Dashboard(){
    return(
        <div className="container mx-auto p-4">
            <h1 className="text-3xl mb-4">Dashboard</h1>
            <StudentForm />
            <StudentList />
        </div>

    );
}

export default Dashboard;