// src/components/TaskCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function TaskCard({ title, to }) {
    return (
        <Link
            to={to}
            className="card card-secondary p-md text-center"
        >
            {title}
        </Link>
    );
}
