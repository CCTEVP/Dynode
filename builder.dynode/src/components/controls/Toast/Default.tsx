import { App } from "antd";

/**
 * Toast utility for displaying ephemeral messages to users
 * Wraps Ant Design's message API for consistent usage across the app
 *
 * Supports four variations:
 * - success: Green background with checkmark icon
 * - info: Blue background with info icon
 * - warning: Yellow/amber background with warning icon
 * - error: Red background with error icon
 */

const defaultConfig = {
  duration: 3, // seconds
};

/**
 * Hook to access Toast functionality
 * Must be used within an Ant Design App component context
 */
export const useToast = () => {
  const { message } = App.useApp();

  return {
    /**
     * Display a success message
     * @param content - The message content to display
     * @param duration - Duration in seconds (default: 3)
     */
    success: (content: string, duration?: number) => {
      message.success({
        content,
        duration: duration ?? defaultConfig.duration,
      });
    },

    /**
     * Display an error message
     * @param content - The message content to display
     * @param duration - Duration in seconds (default: 3)
     */
    error: (content: string, duration?: number) => {
      message.error({
        content,
        duration: duration ?? defaultConfig.duration,
      });
    },

    /**
     * Display an info message
     * @param content - The message content to display
     * @param duration - Duration in seconds (default: 3)
     */
    info: (content: string, duration?: number) => {
      message.info({
        content,
        duration: duration ?? defaultConfig.duration,
      });
    },

    /**
     * Display a warning message
     * @param content - The message content to display
     * @param duration - Duration in seconds (default: 3)
     */
    warning: (content: string, duration?: number) => {
      message.warning({
        content,
        duration: duration ?? defaultConfig.duration,
      });
    },

    /**
     * Display a loading message
     * @param content - The message content to display
     * @param duration - Duration in seconds (default: 0 = until manually closed)
     * @returns A function to close the loading message
     */
    loading: (content: string, duration?: number) => {
      return message.loading({
        content,
        duration: duration ?? 0,
      });
    },

    /**
     * Destroy all messages
     */
    destroy: () => {
      message.destroy();
    },
  };
};

export default useToast;
