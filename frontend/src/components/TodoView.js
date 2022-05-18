import { FormControlLabel, IconButton } from '@material-ui/core';
import { Checkbox } from '@material-ui/core';
import { Typography, Accordion, makeStyles, AccordionSummary, AccordionDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import dayjs from 'dayjs';

const relativeTime = require('dayjs/plugin/relativeTime');
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export default function TodoView({ todo, onToggleComplete, onDelete }) {

    const classes = useStyles();

    function handleToggleCompleteClick(event) {
        event.stopPropagation();
        if (onToggleComplete) {
            onToggleComplete(todo, event.target.checked);
        }
    }

    function handleDeleteClick(event) {
        event.stopPropagation();
        if (onDelete) {
            onDelete(todo);
        }
    }

    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-label="Expand"
                aria-controls={`additional-${todo._id}-content`}
                id={`additional-${todo._id}-header`}>

                <div className={classes.summary}>
                    <FormControlLabel
                        aria-label="Complete"
                        onClick={handleToggleCompleteClick}
                        onFocus={event => event.stopPropagation()}
                        control={<Checkbox color="primary" checked={todo.isComplete} />}
                        label={todo.title}
                    />
                    <span style={{ flexGrow: 1 }} />
                    <Typography style={{ color: statusColor(todo) }}>
                        {todo.isComplete ?
                            `Complete! (was due ${dayjs(todo.dueDate).format('lll')})` :
                            `Due ${dayjs(todo.dueDate).fromNow()}`}
                    </Typography>
                    <IconButton aria-label="delete" color="secondary" onClick={handleDeleteClick}>
                        <DeleteForeverIcon />
                    </IconButton>
                </div>

            </AccordionSummary>
            <AccordionDetails>
                <Typography color="textSecondary">
                    {todo.description ? todo.description : 'No additional info'}
                </Typography>
            </AccordionDetails>
        </Accordion>
    )
}

const useStyles = makeStyles(theme => ({
    summary: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    },
}));

function isOverdue(todo) {
    return !todo.isComplete &&
        dayjs(todo.dueDate).isBefore(dayjs());
}

function isUpcoming(todo) {
    return !isOverdue(todo) && !todo.isComplete &&
        dayjs(todo.dueDate).isBefore(dayjs().add(3, 'day'));
}

function statusColor(todo) {
    if (todo.isComplete) {
        return 'green';
    }
    else if (isOverdue(todo)) {
        return 'red';
    }
    else if (isUpcoming(todo)) {
        return 'orange';
    }
    else {
        return 'inherit';
    }
}