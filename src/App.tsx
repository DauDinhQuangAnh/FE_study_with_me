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

  const joinRoom = async (roomName: string) => {
    if (!username) return alert("Vui lòng nhập tên bạn trước!");
    try {
      const resp = await fetch(
        `${API_URL}/getToken?name=${encodeURIComponent(username)}&room=${encodeURIComponent(roomName)}`
      );

      const data = await resp.json();

      if (data.token) {
        setRoomToken(data.token);
      } else {
        alert("Không lấy được token!");
      }
    } catch (e) {
      console.error(e);
      alert("Không thể vào phòng!");
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
