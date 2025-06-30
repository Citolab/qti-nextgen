/**
 * This code demonstrates how to use the OpenAI API to generate chat completions.
 * The generated completions are received as a stream of data from the API and the
 * code includes functionality to handle errors and abort requests using an AbortController.
 * The API_KEY variable needs to be updated with the appropriate value from OpenAI for successful API communication.
 */

import type { Message, Prompt } from '../../model';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_URL_IMAGE = 'https://api.openai.com/v1/images/generations';
const API_KEY = 'YOUR_OPEN_AI_KEY'; // Update with your OpenAI API key

const decoder = new TextDecoder('utf-8');

let controller = null; // Store the AbortController instance

export const decode = (value: Uint8Array) => {
  // Massage and parse the chunk of data
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  const parsedLines = lines
    .map(line => line.replace(/^data: /, '').trim()) // Remove the "data: " prefix
    .filter(line => line !== '' && line !== '[DONE]') // Remove empty lines and "[DONE]"
    .map(line => JSON.parse(line)); // Parse the JSON string
  let content = '';
  for (const parsedLine of parsedLines) {
    const { choices } = parsedLine;
    const { delta } = choices[0];
    if (delta?.content) {
      content = content + delta.content;
    }
  }
  return content;
};

export const getAIChatCompletionReader = async (prompt: Prompt, messages: Message[]) => {
  const response = await getResponse(
    'reader',
    JSON.stringify({
      messages: messages,
      n: prompt.nrOptions ?? 1,
      model: 'gpt-3.5-turbo',
      max_tokens: prompt.maxTokens ?? 300,
      temperature: 1,
      stream: true
    })
  );
  // Read the response as a stream of data
  return response.body.getReader();
};

export const getAIImage = async (prompt: Prompt, messages: Message[]) => {
  const translation = await getAITranslation(prompt, messages[messages.length - 1].content);

  const response = await getResponse(
    'image',
    JSON.stringify({
      prompt: translation
    })
  );
  if (response.ok) {
    const image = await response.json();
    return `<img style="height:200px;width:200px;" src="${image.data[0].url.replace(/&/g, '&amp;')}" alt="generated-image" />`;
  }
  return null;
};

export const getAIChatCompletion = async (prompt: Prompt, messages: Message[]) => {
  const response = await getResponse(
    'reader',
    JSON.stringify({
      messages: messages,
      n: prompt.nrOptions ?? 1,
      model: 'gpt-3.5-turbo',
      max_tokens: prompt.maxTokens ?? 300,
      temperature: 1
    })
  );

  if (response.ok) {
    const data = await response.json();
    return data.choices[0].message.content;
  }
};

const getAITranslation = async (prompt: Prompt, text: string) => {
  const messages = [
    {
      role: 'system',
      content: "Don't include any explanations in your responses. Don't include the question in your response. Just give what i am asking"
    },
    { role: 'user', content: `translate in English: ${text}` }
  ] as Message[];

  return await getAIChatCompletion(prompt, messages);
};

// Fetch the response from the OpenAI API with the signal from AbortController
const getResponse = async (type: 'reader' | 'response' | 'image', body: string) => {
  // Create a new AbortController instance
  controller = new AbortController();
  const signal = controller.signal;

  const response = await fetch(type === 'image' ? API_URL_IMAGE : API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body,
    signal // Pass the signal to the fetch request
  });
  return response;
};
