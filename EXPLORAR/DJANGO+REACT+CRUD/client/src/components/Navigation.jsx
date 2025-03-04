import {Link}from 'react-router-dom';
export function Navigation() {
    return (
        <div className="flex justify-between items-center py-3">
            <Link to="/tasks">

            <h1 class="text-3xl font-bold mb4">
                Tasks APP
            </h1>
            </Link>
    <nav>
        <ul>

            <li className="inline-block mx-2">
                <Link to="/tasks-create">New Task</Link>
            </li>
        </ul>
    </nav>
</div>
    )
}

