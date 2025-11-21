import { useState } from "react";
import { useVSCodePostMessage } from "../hooks/useVSCodePostMessage";

const Login = () => {
    const [url, setUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const postMessage = useVSCodePostMessage();

    const handleLogin = () => {
        postMessage({
            command: 'login',
            data: { url, username, password }
        });
    }
    return (
        <div>
            <h1>Login</h1>
            <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    )
}

export default Login;