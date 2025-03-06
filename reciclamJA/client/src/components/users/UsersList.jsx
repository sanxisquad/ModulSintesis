import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {getAllUsers} from '../../api/user.api.js';
import { UserCard } from './UserCard.jsx';
export function UsersList(){

    const [users, setUsers] = useState([]);

    useEffect(() => {
        console.log('TasksList rendered');
        async function loadUsers(){
            const res = await getAllUsers();
            setUsers(res.data);
            console.log(res);

        }
        loadUsers();
    }
    , [])
    

    return(
        <div className="grid grid-cols-3 gap-3">
            {users.map((user) => (
                <UserCard key={user.id} user={user} />

            ))}
        </div>
    );
}