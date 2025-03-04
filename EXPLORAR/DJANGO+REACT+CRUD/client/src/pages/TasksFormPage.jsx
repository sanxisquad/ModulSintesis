import {get, useForm} from 'react-hook-form';
import { useEffect} from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { createTask, deleteTask, updateTask, getTask } from '../api/tasks.api';
import {toast} from 'react-hot-toast';
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
            toast.success('Task updated');
        }else{

        
        console.log(data)
        await createTask(data);
        toast.success('Task created');
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
        <div className="max-w-xl mx-auto">
            <form onSubmit={onSubmit}>
                <input type="text" placeholder="Title" 
                {...register('title', {required: true})}
                className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                />
                {errors.title && <span>Title is required</span>}
                <br />
                <textarea placeholder="Description"
                {...register('description', {required: true})}
                className="bg-zinc-700 p-3 rounded-lg block w-full mb-3"
                >
                    
                </textarea>
                {errors.description && <span>Description is required</span>}
                <button
                className="bg-indigo-500 px-3 rounded-lg block w-full mt-3"
                >Save</button>
            </form>

            {params.id && <button 
            className="bg-red-500 p-3 rounded-lg w-48 mt-3"
            onClick={async () =>{

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
