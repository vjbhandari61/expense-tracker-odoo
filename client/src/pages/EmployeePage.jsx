import EmployeeViewTable from "../components/employee/EmployeeViewTable";

const EmployeePage = () => {
    return (
        <div className="min-h-screen bg-gray-900 p-4">
            <div className="h-full">
                <EmployeeViewTable/>
            </div>
        </div>
    )
}

export default EmployeePage;