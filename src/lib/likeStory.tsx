import axios from "axios";

export type LikePayload = {
    user_id: number;
    story_id: number;
    timestamp: string; // ISO format
  };
  
  const LIKE_API_URL = "http://127.0.0.1:5050/api/like"; // change to your backend URL
  
 

  export async function sendLike(like: { user_id: number; story_id: number; timestamp: string }) {
    try {
      const response = await axios.post(LIKE_API_URL, like, {
        headers: { "Content-Type": "application/json" },
      });
  
      console.log("Like recorded successfully", response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("error sending like:", err.response?.data || err.message);
      } else {
        console.error("Unexpected error sending like:", err);
      }
    }
  }
  
  export function createLike(userId: number, storyId: number): LikePayload {
    return {
      user_id: userId,
      story_id: storyId,
      timestamp: new Date().toISOString(),
    };
  }
  