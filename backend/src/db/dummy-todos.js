import dayjs from 'dayjs';
import dummyjson from 'dummy-json';
import fs from 'fs';

const myHelpers = {

    daysFromNow(min, max) {
        const minTime = dayjs().add(min, 'day').toDate().getTime();
        const maxTime = dayjs().add(max, 'day').toDate().getTime();
        const newTime = dummyjson.utils.randomInt(minTime, maxTime);
        return dayjs(new Date(newTime)).format();
    }

}

const template = fs.readFileSync('./src/db/dummy-todos-template.hbs', { encoding: 'utf-8' });
const todosJson = dummyjson.parse(template, { helpers: myHelpers });
export const dummyTodos = JSON.parse(todosJson);

// export const dummyTodos = [
//     {
//         title: 'Prepare lab 04',
//         description: 'Complete writing the model solution for the lab exercises.',
//         isComplete: false,
//         dueDate: dayjs('2021-03-19T20:00').toDate()
//     },
//     {
//         title: 'Do the stuff',
//         description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
//         isComplete: true,
//         dueDate: dayjs().add(2, 'day').toDate()
//     },
//     {
//         title: 'Build the things',
//         isComplete: false,
//         dueDate: dayjs().subtract(1, 'week').toDate()
//     },
//     {
//         title: 'Charge the flux capacitors',
//         description: 'We can literally do this whenever - once we\'re done, we can travel back in time to whenever we want.',
//         isComplete: false,
//         dueDate: dayjs().subtract(100, 'year').toDate()
//     },
// ];