export type ActionContext = 'selection' | 'key' | 'follow-up';
export type ActionType = 'new' | 'edit';
export type PromptType = 'text' | 'image';
export type AIActionState = 'loading' | 'selectPrompt' | 'editPrompt' | 'loadingSuggestion' | 'editSuggestion' | 'error';

export interface Action {
  id: string,
  title: string,
  actionContext: ActionContext,
  actionType?: ActionType; // new = default
  prompt?: Prompt,
  icon?: string,
  editEl?: string;
  followUpActions?: Action[],
  followUpPrompts?: Prompt[]
}

export interface Prompt {    
  text: (props: any) => string,
  title?: string,
  nrOptions?: number,
  maxTokens?: number,
  textProps?: TextProp[],  
  promptType?: PromptType, // text = default
}

export interface TextProp {
  id: string,
  title: string,
  type: 'dropdown' | 'text' | 'textarea';
  placeholder?: string;
  values?: string[]
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type: 'text' | 'image';
}