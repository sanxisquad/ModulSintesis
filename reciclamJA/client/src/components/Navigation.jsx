import {Link}from 'react-router-dom';
export function Navigation() {
    return (
        <div className="flex justify-between items-center py-3 background-black-500 ">
            <Link to="/tasks">

            <h1 className="text-3xl font-bold text-green-500 mb-4 ml-20 m-">
                ReciclamJA
            </h1>
            </Link>
    <nav>
        <ul>

            <li className="inline-block mx-2">
                <Link to="/Users">Usuaris</Link>
            </li>
        </ul>
    </nav>
</div>
    )
}

