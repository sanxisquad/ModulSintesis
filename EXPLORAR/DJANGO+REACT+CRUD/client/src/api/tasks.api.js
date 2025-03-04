import axios from 'axios';

const taskApi = axios.create({
    baseURL: 'http://localhost:8000/tasks/api/v1/tasks/',

});

export const getAllTasks = () => {

    return taskApi.get('/');

    //return axios.get('http://localhost:8000/tasks/api/v1/tasks/')

   // const res = axios.get('http://localhost:8000/tasks/api/v1/tasks/')
   // return res;
}

export const createTask = (task) => {    
    return taskApi.post('/', task);
    return axios.post('http://localhost:8000/tasks/api/v1/tasks/', task);
}

export const getTask = (id) => taskApi.get(`/${id}/`);

export const deleteTask = (id) => taskApi.delete(`/${id}/`);

export const updateTask = (id,task) => taskApi.put(`/${id}/`,task);

