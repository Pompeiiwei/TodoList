import TodoView from '../TodoView';
import dayjs from 'dayjs';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

const completedTodo = {
    _id: '605cf065e2f8ff1070e22503',
    title: 'CompleteTodo',
    description: 'CompleteDesc',
    isComplete: true,
    dueDate: dayjs()
}

const overdueTodo = {
    _id: '605cf065e2f8ff1070e22503',
    title: 'OverdueTodo',
    description: 'OverdueDesc',
    isComplete: false,
    dueDate: dayjs().subtract(1, 'day')
}

const upcomingTodo = {
    _id: '605cf065e2f8ff1070e22503',
    title: 'UpcomingTodo',
    description: 'UpcomingDesc',
    isComplete: false,
    dueDate: dayjs().add(1, 'day')
}

const futureTodo = {
    _id: '605cf065e2f8ff1070e22503',
    title: 'FutureTodo',
    description: 'FutureDesc',
    isComplete: false,
    dueDate: dayjs().add(1, 'week')
}

it('testing library - completed todo', () => {

    const onToggleComplete = jest.fn();
    const onDelete = jest.fn();

    render(<TodoView todo={completedTodo} onToggleComplete={onToggleComplete} onDelete={onDelete} />);

    expect(screen.queryByText('CompleteTodo')).not.toBeNull();
    expect(screen.queryByText('CompleteDesc')).not.toBeNull();
    expect(screen.queryByText(`Complete! (was due ${dayjs(completedTodo.dueDate).format('lll')})`)).not.toBeNull();

    const checkbox = screen.getByLabelText('Complete');
    fireEvent.click(checkbox);
    expect(onToggleComplete).toHaveBeenCalledWith(completedTodo, false);

    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(completedTodo);

})

it('testing library - overdue todo', () => {

    const onToggleComplete = jest.fn();
    const onDelete = jest.fn();

    render(<TodoView todo={overdueTodo} onToggleComplete={onToggleComplete} onDelete={onDelete} />);

    expect(screen.queryByText('OverdueTodo')).not.toBeNull();
    expect(screen.queryByText('OverdueDesc')).not.toBeNull();
    expect(screen.queryByText(`Due ${dayjs(overdueTodo.dueDate).fromNow()}`)).not.toBeNull();

    const checkbox = screen.getByLabelText('Complete');
    fireEvent.click(checkbox);
    expect(onToggleComplete).toHaveBeenCalledWith(overdueTodo, true);

    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(overdueTodo);

})

// Etc...