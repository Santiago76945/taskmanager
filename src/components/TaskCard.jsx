// src/components/TaskCard.jsx

import { Link } from 'react-router-dom';

export default function TaskCard({ title, to }) {
    return (
        <Link
            to={to}
            className="card card-secondary p-md text-center m-sm"
        >
            {title}
        </Link>
    );
}
