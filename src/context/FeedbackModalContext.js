import { createContext } from 'react';

/**
 * FeedbackModalContext is assigned values in the FRAME object. It holds `setModal()`,
 * which takes in a string that contains the body of the message, followed by a 
 * boolean for whether the message is an error.
 */
const FeedbackModalContext = createContext();
export default FeedbackModalContext;