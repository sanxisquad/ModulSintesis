import {useForm} from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../api/tasks.api';
export function TasksFormPage() {

    const {register, handleSubmit, formState: {
        errors
    }} = useForm();
    const navigate = useNavigate();
    const onSubmit = handleSubmit(async data => {
        console.log(data)
        await createTask(data);
        navigate('/tasks');


    
    })
    return (
        <div>
        <form onSubmit={onSubmit}>
        <input type="text" placeholder="Title" 
        {...register('title', {required: true})}
        />
        {errors.title && <span>Title is required</span>}
        <br />
        <textarea placeholder="Description"
        {...register('description', {required: true})}
        ></textarea>
        {errors.description && <span>Description is required</span>}
        <button>Create Task</button>
        </form>
        </div>
    );
    }   
