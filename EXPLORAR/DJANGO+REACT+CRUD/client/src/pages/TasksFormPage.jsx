import {get, useForm} from 'react-hook-form';
import { useEffect} from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { createTask, deleteTask, updateTask, getTask } from '../api/tasks.api';
export function TasksFormPage() {

    const {
        register, 
        handleSubmit, 
        formState: {errors},
        setValue
    } = useForm();
    const navigate = useNavigate();
    const params = useParams();
    const onSubmit = handleSubmit(async data => {
        if(params.id){
            await updateTask(params.id,data)
            console.log('Editing task', params.id);
            // console.log(data);
            navigate('/tasks');
            return;
        }else{

        
        console.log(data)
        await createTask(data);
        }
        navigate('/tasks');


    
    });
    useEffect(() => {
       async function loadTask(){
        if(params.id){
            const res = await getTask(params.id);
            setValue('title', res.data.title)
            setValue('description', res.data.description)
        }
    }
    loadTask();
    }, []);

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
                <button>Save</button>
            </form>

            {params.id && <button onClick={async () =>{

                const accepted = window.confirm('Are you sure?');
                if(accepted){
                    await deleteTask(params.id);
                    navigate('/tasks');
                }else{
                    console.log('Task not deleted');
                }

             

            }}>Delete Task</button>}

        </div>
    );
    }   
