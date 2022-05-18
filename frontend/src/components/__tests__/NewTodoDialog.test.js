import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import NewTodoDialog from '../NewTodoDialog';
import dayjs from 'dayjs';
import DayjsUtils from '@date-io/dayjs';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

const relativeTime = require('dayjs/plugin/relativeTime');
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

it('testing library - NewTodoDialog cancel', () => {

    const onAdd = jest.fn();
    const onCancel = jest.fn();

    render(
        <MuiPickersUtilsProvider utils={DayjsUtils}>
            <NewTodoDialog onAdd={onAdd} onCancel={onCancel} dialogOpen={true} />
        </MuiPickersUtilsProvider>
    );

    // Click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Make sure the correct event was fired
    expect(onAdd).toBeCalledTimes(0);
    expect(onCancel).toBeCalledTimes(1);

})

it('testing library - NewTodoDialog add', () => {

    const onAdd = jest.fn();
    const onCancel = jest.fn();

    render(
        <MuiPickersUtilsProvider utils={DayjsUtils}>
            <NewTodoDialog onAdd={onAdd} onCancel={onCancel} dialogOpen={true} />
        </MuiPickersUtilsProvider>
    );

    // Set the values of some of the form inputs
    const txtTitle = screen.getByLabelText('Title');
    userEvent.type(txtTitle, 'TestTitle');
    const txtDescription = screen.getByLabelText('Description');
    userEvent.type(txtDescription, 'TestDescription');

    // Click the add button
    const cancelButton = screen.getByText('Add');
    fireEvent.click(cancelButton);

    // Make sure the correct event was fired, with the correct data.
    expect(onAdd).toBeCalledWith(expect.objectContaining({
        title: 'TestTitle',
        description: 'TestDescription',
        isComplete: false
    }));
    expect(onCancel).toBeCalledTimes(0);

})