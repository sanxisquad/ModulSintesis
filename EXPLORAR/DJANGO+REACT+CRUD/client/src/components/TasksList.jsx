import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {getAllTasks} from '../api/tasks.api.js';
import { TaskCard } from './TaskCard';
export function TasksList(){

    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        console.log('TasksList rendered');
        async function loadTasks(){
            const res = await getAllTasks();
            setTasks(res.data);
            console.log(res);

        }
        loadTasks();
    }
    , [])
    

    return(
        <div className="grid grid-cols-3 gap-3">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />

            ))}
        </div>
    );
}