import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@material-ui/core';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DateTimePicker } from '@material-ui/pickers';

export default function NewTodoDialog({ dialogOpen, onAdd, onCancel }) {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(dayjs().add(1, 'week'));

    return (
        <Dialog open={dialogOpen} onClose={onCancel} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Add item</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Let us know what you need to get done!
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="normal"
                    id="new-todo-title"
                    label="Title"
                    type="text"
                    value={title}
                    onInput={(event) => setTitle(event.target.value)}
                    fullWidth />
                <DateTimePicker
                    id="new-todo-duedate"
                    margin="normal"
                    label="Due date"
                    fullWidth
                    value={dueDate}
                    onChange={(date) => setDueDate(date)} />
                <TextField
                    autoFocus
                    margin="normal"
                    id="new-todo-description"
                    label="Description"
                    type="text"
                    multiline
                    rows={4}
                    value={description}
                    onInput={(event) => setDescription(event.target.value)}
                    fullWidth />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="secondary">
                    Cancel
            </Button>
                <Button onClick={() => onAdd({ title, description, dueDate, isComplete: false })} color="primary">
                    Add
            </Button>
            </DialogActions>
        </Dialog>
    );
}