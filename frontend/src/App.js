import {
  Container,
  Typography,
  AppBar,
  Avatar,
  Toolbar,
  makeStyles,
  CircularProgress,
  Button,
} from '@material-ui/core';
import TodoList from './components/TodoList';
import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { getConfig } from './config';

const useStyles = makeStyles((theme) => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    marginLeft: '12px',
  },
}));

function App() {
  const classes = useStyles();

  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    getAccessTokenSilently,
    logout,
  } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className={classes.loading}>
        <CircularProgress />
      </div>
    );
  }

  if (isAuthenticated) {
    getAccessTokenSilently({
      audience: getConfig().audience,
    }).then((accessToken) => {
      localStorage.setItem('ACCESS_TOKEN', accessToken);
    });
  }

  const logoutWithRedirect = () => {
    logout({
      returnTo: window.location.origin,
    });
    localStorage.removeItem('ACCESS_TOKEN');
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar className={classes.header}>
          <div className={classes.profile}>
            <Avatar alt={user?.name} src={user?.picture} />
            <Typography variant="h6" className={classes.title}>
              {user?.name || 'My'}' Todos
            </Typography>
          </div>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => logoutWithRedirect()}
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Container fixed>
        <Toolbar />
        <main className={classes.main}>
          <TodoList isAuthenticated={isAuthenticated} />
        </main>
      </Container>
    </>
  );
}

export default App;
