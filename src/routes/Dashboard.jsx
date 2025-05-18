// src/routes/Dashboard.jsx

import { Outlet } from 'react-router-dom';

export default function Dashboard() {
    return (
        <div className="container p-lg">
            <Outlet />
        </div>
    );
}
