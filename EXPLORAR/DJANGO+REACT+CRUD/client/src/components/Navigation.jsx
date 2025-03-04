import {Link}from 'react-router-dom';
export function Navigation() {
    return (
        <div>
            <Link to="/tasks">

            <h1>
                Tasks APP
            </h1>
            </Link>
    <nav>
        <ul>

            <li>
                <Link to="/tasks-create">New Task</Link>
            </li>
        </ul>
    </nav>
</div>
    )
}

