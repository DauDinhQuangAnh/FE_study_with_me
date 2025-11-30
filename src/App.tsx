import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useState } from "react";
import AuthPage, { type AuthUser } from "./assets/components/auth/AuthPage";
import Pomodoro from "./assets/components/Pomodoro";
import MusicPlayer from "./assets/components/MusicPlayer";
import Lobby from "./assets/components/lobby/Lobby";

function App() {
  const LIVEKIT_URL = "wss://live.chatbotuit.me";
  const API_URL = "https://api.chatbotuit.me/api";
  const [roomToken, setRoomToken] = useState("");
  const [username, setUsername] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

// SỬA ĐỔI LOGIC VÀO PHÒNG
const joinRoom = async (roomId: string) => {
  try {
    // BƯỚC 1: Báo cho Backend biết mình vào phòng (Để lưu lịch sử)
    await fetch(`${API_URL}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`, // Token đăng nhập
        'Content-Type': 'application/json'
      }
    });

    // BƯỚC 2: Lấy Token Video (LiveKit)
    // Lưu ý: API mới của bạn yêu cầu query param là 'name' và 'room'
    const userJson = localStorage.getItem('user');
    const user = JSON.parse(userJson || '{}');
    
    const resp = await fetch(`${API_URL}/livekit/token?room=${roomId}&name=${user.username}`);
    const data = await resp.json();

    // BƯỚC 3: Kết nối Video
    setRoomToken(data.token);

  } catch (error) {
    alert("Lỗi không thể vào phòng: " + (error instanceof Error ? error.message : String(error)));
  }
};

  const handleAuthSuccess = ({ token, user }: { token: string; user: AuthUser }) => {
    setAuthToken(token);
    setCurrentUser(user);
    setUsername(user.username);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUsername("");
    setRoomToken("");
  };

  if (!authToken || !currentUser) {
    return <AuthPage API_URL={API_URL} onSuccess={handleAuthSuccess} />;
  }

  if (!roomToken) {
    return (
      <Lobby
        API_URL={API_URL}
        username={username}
        onUsernameChange={setUsername}
        onJoinRoom={joinRoom}
        authToken={authToken}
        user={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={roomToken}
      serverUrl={LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100vh", position: "relative" }}
      onDisconnected={() => setRoomToken("")}
    >
      <VideoConference />
      <Pomodoro />
      <MusicPlayer />
    </LiveKitRoom>
  );
}

export default App;
