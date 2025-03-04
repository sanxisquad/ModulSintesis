import {useNavigate} from "react-router-dom";
export function TaskCard({task}) {

    const navigate = useNavigate();
    return (

        <div
            onClick={() => navigate(`/tasks/${task.id}`)}
        >
            <h2>{task.title}</h2>
            <p>{task.description}</p>
        </div>

    )
}

