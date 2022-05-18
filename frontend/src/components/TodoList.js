import { AppContext } from '../AppContextProvider';
import { useState, useContext } from 'react';
import {
  Typography,
  makeStyles,
  CircularProgress,
  Fab,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import TodoView from './TodoView';
import NewTodoDialog from './NewTodoDialog';
import { withAuthenticationRequired } from '@auth0/auth0-react';

const useStyles = makeStyles((theme) => ({
  loadingBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
}));

const TodoList = () => {
  const classes = useStyles();
  const {
    todos,
    todosLoading,
    createTodo,
    updateTodo,
    deleteTodo,
  } = useContext(AppContext);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleToggleComplete(todo, isComplete) {
    updateTodo({ ...todo, isComplete });
  }

  function handleDelete(todo) {
    deleteTodo(todo._id);
  }

  async function handleAdd(todo) {
    await createTodo(todo);
    setDialogOpen(false);
  }

  function handleDialogCancel() {
    setDialogOpen(false);
  }

  return (
    <>
      <Typography variant="h4">Todo list</Typography>
      {todosLoading && (!todos || todos.length === 0) ? (
        <div className={classes.loadingBar}>
          <CircularProgress />
          <Typography variant="h6"> Loading...</Typography>
        </div>
      ) : todos && todos.length > 0 ? (
        todos.map((todo) => (
          <TodoView
            key={todo._id}
            todo={todo}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <Typography variant="h6">No todos here 😢</Typography>
      )}

      <Fab
        color="primary"
        className={classes.fab}
        onClick={() => setDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <NewTodoDialog
        dialogOpen={dialogOpen}
        onAdd={handleAdd}
        onCancel={handleDialogCancel}
      />
    </>
  );
};

export default withAuthenticationRequired(TodoList, {
  onRedirecting: () => <CircularProgress />,
});
