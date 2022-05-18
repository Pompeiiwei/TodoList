/**
 * This program should be run in order to populate the database with dummy data for testing purposes.
 */

import mongoose from 'mongoose';
import connectToDatabase from './db-connect';
import { Todo } from './todos-schema';
import dayjs from 'dayjs';
import { dummyTodos } from './dummy-todos';

main();

async function main() {
    await connectToDatabase();
    console.log('Connected to database!');
    console.log();

    await clearDatabase();
    console.log();

    await addData();
    console.log();

    // Disconnect when complete
    await mongoose.disconnect();
    console.log('Disconnected from database!');
}

// TODO Exercise Two: Complete the clearDatabase() and addData() functions below.

async function clearDatabase() {
    const result = await Todo.deleteMany({});
    console.log(`Cleared database (removed ${result.deletedCount} todos).`);
}

async function addData() {

    // More efficient than adding one-by-one.
    const result = await Todo.insertMany(dummyTodos.map(t => new Todo(t)));
    console.log(`Added ${result.length} todos to the database.`);
    for (let todo of result) {
        console.log(` - ${todo.title} (${todo._id})`);
    }
}