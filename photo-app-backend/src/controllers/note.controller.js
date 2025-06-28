import express from 'express';
import asyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import Note from '../models/note.model';
import { model } from 'mongoose';
import openAi from '../config/openAi';


const createNote = asyncHandler(async (req, res) => {try {
    
        const { title, content } = req.body;
        const userId = req.user._id;
    
        const note = await Note.create({
            title, content, userId
        });
    
        if(!note) {
            throw new ApiError(400, "Failed to create note");
        }
        res.status(201).json(
            new ApiResponse(201, "Note created successfully", note)
        );
} catch (error) {
        throw new ApiError(500, "Internal Server Error", error);
    }
});


const checkGrammer = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user._id;

        if(!content)
        {
            throw new ApiError(400, "Content is required for grammar check");
        }

        // Call OpenAI API to check grammar
        const response = await openAi.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: `Fix any grammar issues in the following note: ${content}` }
            ]
        });

        const result = response.choices[0].message.content;

        res.status(200).json(
            new ApiResponse(200, "Grammar checked successfully", result)
        );
    } catch (error) {
        throw new ApiError(500, "Failed to check grammar", error);
    }
});


const getNotes = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const notes = await Note.find({ userId });

        res.status(200).json(
            new ApiResponse(200, "Notes retrieved successfully", notes)
        );
    } catch (error) {
        throw new ApiError(500, "Failed to retrieve notes", error);
    }
});

const deleteNote = asyncHandler(async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user._id;

        const note = await Note.findOneAndDelete({ _id: noteId, userId });

        if (!note) {
            throw new ApiError(404, "Note not found");
        }

        res.status(200).json(
            new ApiResponse(200, "Note deleted successfully", note)
        );
    } catch (error) {
        throw new ApiError(500, "Failed to delete note", error);
    }
});

model.exports = {
    createNote  ,
    checkGrammer,
    deleteNote,
    getNotes
};