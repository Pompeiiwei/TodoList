import React from 'react';
import useCrud from './hooks/useCrud';
// import axios from 'axios';
import dayjs from 'dayjs';

const AppContext = React.createContext({
    todos: []
});

function AppContextProvider({ children }) {

    const {
        data: todos,
        isLoading: todosLoading,
        // reFetch: refetchTodos,
        update: updateTodo,
        deleteItem: deleteTodo,
        create: createTodo

    } = useCrud('/api/todos', []);


    // async function addTodo(todo) {
    //     try {
    //         await axios.post(`/api/todos`, todo);
    //         refetchTodos();
    //     }
    //     catch (err) {
    //         console.error(err);
    //     }
    // }

    // async function updateTodo(todo) {
    //     try {
    //         await axios.put(`/api/todos/${todo._id}`, todo);
    //         refetchTodos();
    //     }
    //     catch (err) {
    //         console.error(err);
    //     }
    // }

    // async function deleteTodo(id) {
    //     try {
    //         await axios.delete(`/api/todos/${id}`);
    //         refetchTodos();
    //     }
    //     catch (err) {
    //         console.error(err);
    //     }
    // }

    todos.sort((t1, t2) => dayjs(t1.dueDate).diff(dayjs(t2.dueDate)));

    // The context value that will be supplied to any descendants of this component.
    const context = {
        todos,
        todosLoading,
        createTodo,
        updateTodo,
        deleteTodo
    };

    // Wraps the given child components in a Provider for the above context.
    return (
        <AppContext.Provider value={context}>
            {children}
        </AppContext.Provider>
    );
}

export {
    AppContext,
    AppContextProvider
};