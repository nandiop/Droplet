import {OpenAi} from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openAi = new OpenAi({
    apiKey: process.env.OPEN_AI_API_KEY,
});

export default openAi;