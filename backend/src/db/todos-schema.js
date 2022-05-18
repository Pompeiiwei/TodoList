import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// TODO Exercise One: Model your schema here. Make sure to export it!
const todoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    sub: String,
    isComplete: Boolean,
    dueDate: { type: Date, required: true },
  },
  {
    timestamps: {},
  }
);

const Todo = mongoose.model('Todo', todoSchema);

export { Todo };
